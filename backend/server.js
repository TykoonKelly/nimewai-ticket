// backend/server.js
// ============================================
// COMPLETE BACKEND SERVER WITH FIREBASE & M-PESA
// FIXED CORS FOR LOCALHOST WITH CREDENTIALS
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// ============================================
// M-PESA CONFIGURATION
// ============================================
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'LQxqCDkTnWz24sdIJK3TpYAR8UktKdb0keH8P2SVzmoBgDjy',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'a20cRjWCuk4RRIskUusLrlPEOhxgsqmvC5gHAvRDLBeSamdK3zPvnAASuN5KDtWb',
  passkey: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  shortCode: process.env.MPESA_SHORTCODE || '174379',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
};

const MPESA_BASE_URL = MPESA_CONFIG.environment === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// ============================================
// BACKEND URL CONFIGURATION
// ============================================
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
console.log(`🌐 Using backend URL: ${BACKEND_URL}`);

// ============================================
// INITIALIZE FIREBASE ADMIN SDK
// ============================================

let admin;
let db;

try {
  admin = require('firebase-admin');

  if (!admin) {
    throw new Error('Firebase Admin SDK not loaded');
  }

  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  console.log('📁 Looking for service account at:', serviceAccountPath);

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: firebase-service-account.json not found!');
    console.error('📁 Please download your service account key from Firebase Console');
    console.error('   and save it as: backend/firebase-service-account.json');
    process.exit(1);
  }

  const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountContent);
  
  const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Service account file is missing required fields:', missingFields.join(', '));
    process.exit(1);
  }

  console.log('✅ Service account file loaded successfully');
  console.log(`   Project ID: ${serviceAccount.project_id}`);

  let credential;
  try {
    credential = admin.credential.cert(serviceAccount);
  } catch (certError) {
    console.log('Standard cert method failed, trying alternative...');
    try {
      const { cert } = require('firebase-admin/app');
      credential = cert(serviceAccount);
    } catch (altError) {
      console.error('Both cert methods failed');
      throw new Error('Cannot create credential');
    }
  }

  try {
    admin.initializeApp({
      credential: credential,
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  } catch (initError) {
    if (admin.apps && admin.apps.length > 0) {
      console.log('Firebase app already initialized, using existing instance');
    } else {
      throw initError;
    }
  }
  
  db = admin.firestore();
  
  console.log('✅ Firebase Admin SDK initialized successfully');
  
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE - FIXED CORS FOR LOCALHOST
// ============================================

// ✅ Proper CORS configuration - NOT using wildcard with credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins (specific, not wildcard)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      // Add your production URLs here
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS: Blocking origin ${origin}`);
      callback(null, false);
    }
  },
  credentials: true, // ✅ Allow credentials with specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly with proper headers
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400');
  }
  res.status(204).send();
});

// ✅ Add request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// ============================================
// M-PESA HELPER FUNCTIONS
// ============================================

async function getMpesaToken() {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get access token: ${errorData.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    logWithTime(`❌ Error getting M-Pesa token: ${error.message}`, 'error');
    throw error;
  }
}

function getMpesaTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function generateMpesaPassword(shortCode, passkey, timestamp) {
  const str = `${shortCode}${passkey}${timestamp}`;
  return Buffer.from(str).toString('base64');
}

async function initiateMpesaSTKPush({ phoneNumber, amount, accountReference, transactionDesc, callbackURL }) {
  try {
    const token = await getMpesaToken();
    const timestamp = getMpesaTimestamp();
    const password = generateMpesaPassword(
      MPESA_CONFIG.shortCode,
      MPESA_CONFIG.passkey,
      timestamp
    );

    // Use localhost for callback
    const callbackUrl = callbackURL || `${BACKEND_URL}/api/mpesa/callback`;

    console.log(`📞 M-Pesa Callback URL: ${callbackUrl}`);

    const requestBody = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: MPESA_CONFIG.shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || `TICKET${Date.now().toString().slice(-8)}`,
      TransactionDesc: transactionDesc || 'Ticket Payment',
    };

    logWithTime(`📤 Sending STK Push request to M-Pesa...`, 'info');
    logWithTime(`   Amount: KES ${requestBody.Amount}`, 'info');
    logWithTime(`   Phone: ${requestBody.PhoneNumber}`, 'info');
    logWithTime(`   Callback: ${requestBody.CallBackURL}`, 'info');

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logWithTime(`❌ M-Pesa STK Push error: ${JSON.stringify(errorData)}`, 'error');
      throw new Error(errorData.errorMessage || 'Failed to initiate M-Pesa payment');
    }

    const data = await response.json();
    logWithTime(`✅ STK Push initiated successfully`, 'success');
    logWithTime(`   CheckoutRequestID: ${data.CheckoutRequestID}`, 'info');
    
    return data;

  } catch (error) {
    logWithTime(`❌ Error initiating M-Pesa: ${error.message}`, 'error');
    throw error;
  }
}

async function queryMpesaStatus(checkoutRequestID) {
  try {
    const token = await getMpesaToken();
    const timestamp = getMpesaTimestamp();
    const password = generateMpesaPassword(
      MPESA_CONFIG.shortCode,
      MPESA_CONFIG.passkey,
      timestamp
    );

    const requestBody = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessage || 'Failed to query payment status');
    }

    return await response.json();

  } catch (error) {
    logWithTime(`❌ Error querying M-Pesa status: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateTicketId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ticket-${timestamp}-${random}`;
}

function formatPhoneNumber(phone) {
  let formatted = phone.replace(/\s/g, '');
  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  } else if (formatted.startsWith('+')) {
    formatted = formatted.substring(1);
  }
  return formatted;
}

function logWithTime(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// ============================================
// FIREBASE DATABASE FUNCTIONS
// ============================================

async function createTicketInFirebase(ticketData) {
  try {
    const ticketsRef = db.collection('tickets');
    
    const ticket = {
      ticketId: ticketData.ticketId || generateTicketId(),
      eventId: ticketData.eventId,
      eventTitle: ticketData.eventTitle,
      eventDate: ticketData.eventDate,
      eventVenue: ticketData.eventVenue,
      eventCity: ticketData.eventCity,
      eventCreatorId: ticketData.eventCreatorId,
      userId: ticketData.userId,
      quantity: ticketData.quantity,
      totalPrice: ticketData.totalPrice,
      paymentMethod: ticketData.paymentMethod || 'mpesa',
      paymentStatus: ticketData.paymentStatus || 'paid',
      isVerified: ticketData.isVerified || false,
      purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedAt: ticketData.verifiedAt || null
    };

    const docRef = await ticketsRef.add(ticket);
    
    logWithTime(`🎫 Ticket created: ${ticket.ticketId}`, 'success');
    logWithTime(`   Event: ${ticket.eventTitle}`, 'success');
    logWithTime(`   Quantity: ${ticket.quantity}`, 'success');
    logWithTime(`   Total: KES ${ticket.totalPrice}`, 'success');
    
    return {
      id: docRef.id,
      ...ticket
    };
  } catch (error) {
    logWithTime(`❌ Error creating ticket: ${error.message}`, 'error');
    throw error;
  }
}

async function getTicketByTicketId(ticketId) {
  try {
    const ticketsRef = db.collection('tickets');
    const snapshot = await ticketsRef
      .where('ticketId', '==', ticketId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    logWithTime(`❌ Error fetching ticket: ${error.message}`, 'error');
    throw error;
  }
}

async function updateTicketInFirebase(ticketId, updateData) {
  try {
    const ticketsRef = db.collection('tickets');
    const snapshot = await ticketsRef
      .where('ticketId', '==', ticketId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const doc = snapshot.docs[0];
    await doc.ref.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logWithTime(`📝 Ticket ${ticketId} updated`, 'success');
    return true;
  } catch (error) {
    logWithTime(`❌ Error updating ticket: ${error.message}`, 'error');
    throw error;
  }
}

async function updateEventInventory(eventId, quantity) {
  try {
    const eventRef = db.collection('events').doc(eventId);
    
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef);
      if (!doc.exists) {
        throw new Error('Event not found');
      }

      const eventData = doc.data();
      const currentAvailable = eventData.availableTickets || 0;
      
      if (currentAvailable < quantity) {
        throw new Error(`Not enough tickets available. Only ${currentAvailable} left.`);
      }

      transaction.update(eventRef, {
        availableTickets: admin.firestore.FieldValue.increment(-quantity),
        soldTickets: admin.firestore.FieldValue.increment(quantity),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    logWithTime(`📊 Event ${eventId} inventory updated (-${quantity})`, 'success');
    return true;
  } catch (error) {
    logWithTime(`❌ Error updating inventory: ${error.message}`, 'error');
    throw error;
  }
}

async function savePaymentToFirebase(paymentData) {
  try {
    const paymentsRef = db.collection('payments');
    const docRef = await paymentsRef.add({
      ...paymentData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    logWithTime(`💰 Payment saved: ${docRef.id}`, 'success');
    return docRef.id;
  } catch (error) {
    logWithTime(`❌ Error saving payment: ${error.message}`, 'error');
    throw error;
  }
}

async function getUserByUid(uid) {
  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    logWithTime(`❌ Error getting user: ${error.message}`, 'error');
    return null;
  }
}

// ============================================
// PAYMENT PROCESSING FUNCTIONS
// ============================================

async function processSuccessfulPayment(stkCallback, orderData) {
  try {
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    let amount = 0;
    let mpesaReceiptNumber = '';
    let transactionDate = '';
    let phoneNumber = '';

    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach(item => {
        switch (item.Name) {
          case 'Amount':
            amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            phoneNumber = item.Value;
            break;
        }
      });
    }

    const ticketData = {
      ticketId: generateTicketId(),
      eventId: orderData.eventId,
      eventTitle: orderData.eventTitle,
      eventDate: orderData.eventDate,
      eventVenue: orderData.eventVenue,
      eventCity: orderData.eventCity,
      eventCreatorId: orderData.eventCreatorId,
      userId: orderData.userId,
      quantity: orderData.quantity,
      totalPrice: amount,
      paymentMethod: 'mpesa',
      paymentStatus: 'paid',
      isVerified: false,
      verifiedAt: null
    };

    const ticket = await createTicketInFirebase(ticketData);
    await updateEventInventory(orderData.eventId, orderData.quantity);

    const paymentRecord = {
      orderId: orderData.orderId || ticket.id,
      ticketId: ticket.ticketId,
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID,
      amount: amount,
      phoneNumber: phoneNumber,
      receiptNumber: mpesaReceiptNumber,
      status: 'completed',
      transactionDate: transactionDate,
      mpesaData: stkCallback
    };
    await savePaymentToFirebase(paymentRecord);

    logWithTime(`✅ Payment successful!`, 'success');
    logWithTime(`   Ticket ID: ${ticket.ticketId}`, 'success');
    logWithTime(`   Receipt: ${mpesaReceiptNumber}`, 'success');
    logWithTime(`   Amount: KES ${amount}`, 'success');

    return {
      ticket: ticket,
      payment: paymentRecord
    };

  } catch (error) {
    logWithTime(`❌ Error processing payment: ${error.message}`, 'error');
    throw error;
  }
}

async function processFailedPayment(stkCallback, orderData) {
  try {
    const {
      CheckoutRequestID,
      MerchantRequestID,
      ResultCode,
      ResultDesc
    } = stkCallback;

    const paymentRecord = {
      orderId: orderData.orderId || 'unknown',
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID,
      status: 'failed',
      errorCode: ResultCode,
      errorMessage: ResultDesc,
      mpesaData: stkCallback
    };
    await savePaymentToFirebase(paymentRecord);

    logWithTime(`❌ Payment failed: ${ResultDesc}`, 'error');
    return paymentRecord;

  } catch (error) {
    logWithTime(`❌ Error processing failed payment: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================
// PUBLIC API ENDPOINTS
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: MPESA_CONFIG.environment,
    firebase: 'connected',
    serviceAccount: 'loaded',
    backendUrl: BACKEND_URL,
    cors: 'configured'
  });
});

app.get('/api/events', optionalAuth, async (req, res) => {
  try {
    const eventsRef = db.collection('events');
    const snapshot = await eventsRef
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      total: events.length,
      events: events
    });
  } catch (error) {
    logWithTime(`❌ Error getting events: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error getting events',
      error: error.message
    });
  }
});

app.get('/api/events/:eventId', optionalAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventRef = db.collection('events').doc(eventId);
    const doc = await eventRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    logWithTime(`❌ Error getting event: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error getting event',
      error: error.message
    });
  }
});

// ============================================
// PROTECTED API ENDPOINTS
// ============================================

app.post('/api/order/create', requireAuth, async (req, res) => {
  logWithTime('📝 Creating order...', 'info');

  try {
    const {
      eventId,
      eventTitle,
      eventDate,
      eventVenue,
      eventCity,
      eventCreatorId,
      quantity,
      totalPrice,
      ticketDetails,
      email,
      userName,
      isGuest,
      userId,
      guestEmail
    } = req.body;

    const authUserId = req.user.uid;

    if (!eventId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventId, quantity'
      });
    }

    const checkoutId = `ws_CO_${Date.now()}`;

    const orderData = {
      eventId,
      eventTitle,
      eventDate,
      eventVenue,
      eventCity,
      eventCreatorId: eventCreatorId || 'user-1',
      userId: userId || authUserId,
      userEmail: email || req.user.email || 'unknown',
      userName: userName || req.user.name || 'User',
      isGuest: isGuest || false,
      guestEmail: guestEmail || null,
      quantity,
      totalPrice,
      ticketDetails: ticketDetails || [],
      checkoutRequestId: checkoutId,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ordersRef = db.collection('tempOrders');
    const docRef = await ordersRef.add(orderData);

    logWithTime(`✅ Order created: ${docRef.id}`, 'success');
    logWithTime(`   Event: ${eventTitle}`, 'success');
    logWithTime(`   Quantity: ${quantity}`, 'success');
    logWithTime(`   Checkout ID: ${checkoutId}`, 'success');

    res.json({
      success: true,
      orderId: docRef.id,
      checkoutId: checkoutId,
      data: orderData
    });

  } catch (error) {
    logWithTime(`❌ Error creating order: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

app.post('/api/mpesa/initiate', requireAuth, async (req, res) => {
  logWithTime('📱 Initiating M-Pesa payment from frontend', 'info');

  try {
    const {
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
      checkoutId
    } = req.body;

    const userId = req.user.uid;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: phoneNumber, amount'
      });
    }

    let orderData = null;
    if (checkoutId) {
      try {
        const ordersRef = db.collection('tempOrders');
        const snapshot = await ordersRef
          .where('checkoutRequestId', '==', checkoutId)
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          orderData = {
            id: doc.id,
            ...doc.data()
          };
          logWithTime(`📦 Found order: ${orderData.id}`, 'info');
        }
      } catch (error) {
        logWithTime(`⚠️ Could not find order: ${error.message}`, 'warning');
      }
    }

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const mpesaResponse = await initiateMpesaSTKPush({
      phoneNumber: formatPhoneNumber(phoneNumber),
      amount: amount,
      accountReference: accountReference || `TICKET${Date.now().toString().slice(-8)}`,
      transactionDesc: transactionDesc || 'Ticket Payment',
      callbackURL: `${BACKEND_URL}/api/mpesa/callback`
    });

    if (mpesaResponse.CheckoutRequestID && orderData) {
      await db.collection('tempOrders').doc(orderData.id).update({
        mpesaCheckoutId: mpesaResponse.CheckoutRequestID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      data: mpesaResponse
    });

  } catch (error) {
    logWithTime(`❌ Error initiating payment: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error initiating payment',
      error: error.message
    });
  }
});

app.get('/api/mpesa/status/:checkoutId', requireAuth, async (req, res) => {
  const { checkoutId } = req.params;
  logWithTime(`🔍 Getting payment status: ${checkoutId}`, 'info');

  try {
    const status = await queryMpesaStatus(checkoutId);
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logWithTime(`❌ Error getting payment status: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error getting payment status',
      error: error.message
    });
  }
});

app.get('/api/tickets/user', requireAuth, async (req, res) => {
  const userId = req.user.uid;
  logWithTime(`📋 Getting tickets for user: ${userId}`, 'info');

  try {
    const ticketsRef = db.collection('tickets');
    const snapshot = await ticketsRef
      .where('userId', '==', userId)
      .orderBy('purchaseDate', 'desc')
      .get();

    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });

    logWithTime(`   Found ${tickets.length} tickets`, 'info');

    res.json({
      success: true,
      total: tickets.length,
      tickets: tickets
    });

  } catch (error) {
    logWithTime(`❌ Error getting tickets: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error getting tickets',
      error: error.message
    });
  }
});

app.get('/api/ticket/:ticketId', requireAuth, async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.uid;
  logWithTime(`🎫 Getting ticket: ${ticketId}`, 'info');

  try {
    const ticket = await getTicketByTicketId(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.userId !== userId && ticket.eventCreatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this ticket'
      });
    }

    res.json({
      success: true,
      ticket: ticket
    });

  } catch (error) {
    logWithTime(`❌ Error getting ticket: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error getting ticket',
      error: error.message
    });
  }
});

app.post('/api/ticket/verify', requireAuth, async (req, res) => {
  logWithTime('🎫 Verifying ticket...', 'info');

  try {
    const { ticketId } = req.body;
    const verifierUid = req.user.uid;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Missing ticketId'
      });
    }

    const ticket = await getTicketByTicketId(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.eventCreatorId !== verifierUid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this ticket'
      });
    }

    if (ticket.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already verified',
        verifiedAt: ticket.verifiedAt
      });
    }

    if (ticket.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not paid'
      });
    }

    await updateTicketInFirebase(ticketId, {
      isVerified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logWithTime(`✅ Ticket ${ticketId} verified`, 'success');

    res.json({
      success: true,
      message: 'Ticket verified successfully',
      ticket: {
        ticketId: ticket.ticketId,
        eventTitle: ticket.eventTitle,
        eventDate: ticket.eventDate,
        eventVenue: ticket.eventVenue,
        quantity: ticket.quantity,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logWithTime(`❌ Error verifying ticket: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error verifying ticket',
      error: error.message
    });
  }
});

app.post('/api/ticket/cancel', requireAuth, async (req, res) => {
  logWithTime('❌ Cancelling ticket...', 'info');

  try {
    const { ticketId } = req.body;
    const userId = req.user.uid;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Missing ticketId'
      });
    }

    const ticket = await getTicketByTicketId(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own tickets'
      });
    }

    if (ticket.paymentStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket already cancelled'
      });
    }

    if (ticket.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a verified ticket'
      });
    }

    await updateTicketInFirebase(ticketId, {
      paymentStatus: 'cancelled'
    });

    await updateEventInventory(ticket.eventId, -ticket.quantity);

    logWithTime(`✅ Ticket ${ticketId} cancelled`, 'success');

    res.json({
      success: true,
      message: 'Ticket cancelled successfully'
    });

  } catch (error) {
    logWithTime(`❌ Error cancelling ticket: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Error cancelling ticket',
      error: error.message
    });
  }
});

// ============================================
// M-PESA CALLBACK ENDPOINT
// ============================================

app.post('/api/mpesa/callback', async (req, res) => {
  logWithTime('📱 M-Pesa Callback received!', 'info');

  try {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      logWithTime('❌ Invalid callback data', 'error');
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback data'
      });
    }

    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    logWithTime(`📊 Payment Result: ${ResultCode} - ${ResultDesc}`, 'info');

    let orderData = null;
    try {
      const ordersRef = db.collection('tempOrders');
      const snapshot = await ordersRef
        .where('checkoutRequestId', '==', CheckoutRequestID)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        orderData = {
          id: doc.id,
          ...doc.data()
        };
        await doc.ref.delete();
        logWithTime(`📦 Found and removed order: ${orderData.id}`, 'info');
      }
    } catch (error) {
      logWithTime(`⚠️ Could not find order: ${error.message}`, 'warning');
    }

    if (!orderData) {
      logWithTime(`⚠️ No order data found for: ${CheckoutRequestID}`, 'warning');
      orderData = {
        orderId: `ORDER-${Date.now()}`,
        eventId: 'unknown',
        eventTitle: 'Unknown Event',
        eventDate: 'Unknown Date',
        eventVenue: 'Unknown Venue',
        eventCity: 'Unknown City',
        eventCreatorId: 'unknown',
        userId: 'unknown',
        quantity: 1
      };
    }

    if (ResultCode === 0) {
      await processSuccessfulPayment(stkCallback, orderData);
    } else {
      await processFailedPayment(stkCallback, orderData);
    }

    res.json({
      ResultCode: 0,
      ResultDesc: 'Payment processed successfully'
    });

  } catch (error) {
    logWithTime(`❌ Error processing callback: ${error.message}`, 'error');
    res.status(200).json({
      ResultCode: 1,
      ResultDesc: `Error: ${error.message}`
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  logWithTime(`💥 Error: ${err.message}`, 'error');
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================');
  console.log('🚀 BACKEND SERVER STARTED');
  console.log('========================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Server: http://127.0.0.1:${PORT}`);
  console.log(`📱 M-Pesa Initiate: POST /api/mpesa/initiate`);
  console.log(`📱 M-Pesa Status: GET /api/mpesa/status/:id`);
  console.log(`📱 M-Pesa Callback: POST /api/mpesa/callback`);
  console.log(`📞 M-Pesa Callback URL: ${BACKEND_URL}/api/mpesa/callback`);
  console.log(`🎫 Create Order: POST /api/order/create`);
  console.log(`📋 User Tickets: GET /api/tickets/user`);
  console.log('========================================');
  console.log(`🌍 Environment: ${MPESA_CONFIG.environment}`);
  console.log(`💳 Shortcode: ${MPESA_CONFIG.shortCode}`);
  console.log('========================================\n');
});

module.exports = { app };