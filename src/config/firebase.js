// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  runTransaction,
  increment,
  orderBy,
  limit
} from 'firebase/firestore';
import env from '../utils/env'; // Import the environment handler

// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Get Firebase config from environment variables with fallbacks
const firebaseConfig = {
  apiKey: env.get('FIREBASE_API_KEY') || "AIzaSyAsqgHT8svju3l-HvnOKa_vaQpYU07OcP0",
  authDomain: env.get('FIREBASE_AUTH_DOMAIN') || "nimewai-ticket.firebaseapp.com",
  projectId: env.get('FIREBASE_PROJECT_ID') || "nimewai-ticket",
  storageBucket: env.get('FIREBASE_STORAGE_BUCKET') || "nimewai-ticket.firebasestorage.app",
  messagingSenderId: env.get('FIREBASE_MESSAGING_SENDER_ID') || "44992884418",
  appId: env.get('FIREBASE_APP_ID') || "1:44992884418:web:813dc4c60e3b746bcd155b",
  measurementId: env.get('FIREBASE_MEASUREMENT_ID') || "G-F9MNHQ47GY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('⚠️ Analytics not available:', error.message);
  }
}

console.log(`🔥 Firebase initialized (${env.getEnvironment()})`);
console.log(`📁 Project: ${firebaseConfig.projectId}`);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Sign Up - Creates user in Firebase Auth and Firestore
export const signUp = async (email, password, fullName) => {
  try {
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Update display name
    await updateProfile(user, { displayName: fullName });
    
    // 3. Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      fullName: fullName,
      email: email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 4. Store session data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userUid', user.uid);
    
    return { user, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', userData?.fullName || user.displayName || 'User');
    localStorage.setItem('userUid', user.uid);
    
    return { user, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// Sign In with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Create user profile if new
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.displayName || 'User');
    localStorage.setItem('userUid', user.uid);
    
    return { user, error: null };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: error.message };
  }
};

// Reset Password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: getErrorMessage(error.code) };
  }
};

// ============================================
// EVENT FUNCTIONS
// ============================================

// Create Event
export const createEvent = async (eventData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const event = {
      ...eventData,
      createdBy: user.uid,
      availableTickets: eventData.totalTickets,
      soldTickets: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'events'), event);
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Create event error:', error);
    return { id: null, error: error.message };
  }
};

// Get All Events with Filters
export const getEvents = async (filters = {}) => {
  try {
    let q = collection(db, 'events');
    const constraints = [];
    
    // Add filters
    if (filters.category && filters.category !== 'All') {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.city && filters.city !== 'All Cities') {
      constraints.push(where('city', '==', filters.city));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    // Always get active events first
    constraints.push(where('status', '==', 'active'));
    
    // Add sorting
    constraints.push(orderBy('createdAt', 'desc'));
    
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    return { events, error: null };
  } catch (error) {
    console.error('Get events error:', error);
    return { events: [], error: error.message };
  }
};

// Get Event by ID
export const getEventById = async (eventId) => {
  try {
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { event: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { event: null, error: 'Event not found' };
    }
  } catch (error) {
    console.error('Get event error:', error);
    return { event: null, error: error.message };
  }
};

// Update Event
export const updateEvent = async (eventId, eventData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(db, 'events', eventId);
    await updateDoc(docRef, {
      ...eventData,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Update event error:', error);
    return { error: error.message };
  }
};

// Delete Event
export const deleteEvent = async (eventId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, 'events', eventId));
    return { error: null };
  } catch (error) {
    console.error('Delete event error:', error);
    return { error: error.message };
  }
};

// ============================================
// TICKET FUNCTIONS
// ============================================

// Purchase Tickets (Transaction ensures atomicity)
export const purchaseTickets = async (eventId, quantity, paymentMethod) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get event details
    const { event, error } = await getEventById(eventId);
    if (error) throw new Error(error);
    if (!event) throw new Error('Event not found');
    
    // Validate availability
    if (event.availableTickets < quantity) {
      throw new Error('Not enough tickets available');
    }
    
    // Use transaction to ensure atomicity
    const result = await runTransaction(db, async (transaction) => {
      // Get fresh event data
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = eventDoc.data();
      if (eventData.availableTickets < quantity) {
        throw new Error('Not enough tickets available');
      }
      
      // Generate unique ticket ID
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Update event - decrement available tickets
      transaction.update(eventRef, {
        availableTickets: increment(-quantity),
        soldTickets: increment(quantity),
        updatedAt: serverTimestamp()
      });
      
      // Create ticket document
      const ticketRef = doc(collection(db, 'tickets'));
      const ticketData = {
        ticketId: ticketId,
        eventId: eventId,
        userId: user.uid,
        quantity: quantity,
        totalPrice: eventData.ticketPrice * quantity,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        purchaseDate: serverTimestamp(),
        isVerified: false,
        // Denormalized data for quick access
        eventTitle: eventData.title,
        eventDate: eventData.date,
        eventVenue: eventData.venue,
        eventCity: eventData.city,
        eventCreatorId: eventData.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      transaction.set(ticketRef, ticketData);
      
      return { ticketId: ticketRef.id, ticketNumber: ticketId };
    });
    
    return { 
      ticketId: result.ticketId, 
      ticketNumber: result.ticketNumber,
      error: null 
    };
  } catch (error) {
    console.error('Purchase tickets error:', error);
    return { ticketId: null, ticketNumber: null, error: error.message };
  }
};

// Get User Tickets
export const getUserTickets = async (userId = null) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const uid = userId || user.uid;
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', uid),
      orderBy('purchaseDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() });
    });
    
    return { tickets, error: null };
  } catch (error) {
    console.error('Get user tickets error:', error);
    return { tickets: [], error: error.message };
  }
};

// Get Ticket by ID
export const getTicketById = async (ticketId) => {
  try {
    const docRef = doc(db, 'tickets', ticketId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ticket: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { ticket: null, error: 'Ticket not found' };
    }
  } catch (error) {
    console.error('Get ticket error:', error);
    return { ticket: null, error: error.message };
  }
};

// Verify Ticket (for gate entry)
export const verifyTicket = async (ticketId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const ticketData = ticketDoc.data();
    
    // Check if ticket belongs to this event creator
    if (ticketData.eventCreatorId !== user.uid) {
      throw new Error('You are not authorized to verify this ticket');
    }
    
    if (ticketData.isVerified) {
      throw new Error('Ticket already verified');
    }
    
    if (ticketData.paymentStatus !== 'paid') {
      throw new Error('Ticket is not paid');
    }
    
    await updateDoc(ticketRef, {
      isVerified: true,
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { error: null };
  } catch (error) {
    console.error('Verify ticket error:', error);
    return { error: error.message };
  }
};

// Cancel Ticket
export const cancelTicket = async (ticketId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const ticketData = ticketDoc.data();
    
    // Only the ticket owner can cancel
    if (ticketData.userId !== user.uid) {
      throw new Error('You can only cancel your own tickets');
    }
    
    if (ticketData.paymentStatus === 'cancelled') {
      throw new Error('Ticket already cancelled');
    }
    
    if (ticketData.isVerified) {
      throw new Error('Cannot cancel a verified ticket');
    }
    
    // Use transaction to update both ticket and event
    await runTransaction(db, async (transaction) => {
      // Update ticket
      transaction.update(ticketRef, {
        paymentStatus: 'cancelled',
        updatedAt: serverTimestamp()
      });
      
      // Return tickets to event
      const eventRef = doc(db, 'events', ticketData.eventId);
      const eventDoc = await transaction.get(eventRef);
      if (eventDoc.exists()) {
        transaction.update(eventRef, {
          availableTickets: increment(ticketData.quantity),
          soldTickets: increment(-ticketData.quantity),
          updatedAt: serverTimestamp()
        });
      }
    });
    
    return { error: null };
  } catch (error) {
    console.error('Cancel ticket error:', error);
    return { error: error.message };
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Get Event Tickets (for event organizers)
export const getEventTickets = async (eventId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Verify user is event creator
    const { event, error } = await getEventById(eventId);
    if (error) throw new Error(error);
    if (!event) throw new Error('Event not found');
    
    // Check if user is the event creator
    if (event.createdBy !== user.uid) {
      throw new Error('You are not authorized to view these tickets');
    }
    
    const q = query(
      collection(db, 'tickets'),
      where('eventId', '==', eventId),
      orderBy('purchaseDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() });
    });
    
    return { tickets, error: null };
  } catch (error) {
    console.error('Get event tickets error:', error);
    return { tickets: [], error: error.message };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getErrorMessage = (errorCode) => {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Please log in.',
    'auth/invalid-email': 'Invalid email address. Please check and try again.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups.',
    'auth/unauthorized-domain': 'This domain is not authorized. Please check Firebase settings.'
  };
  return messages[errorCode] || 'An error occurred. Please try again.';
};

// ============================================
// EXPORTS
// ============================================

export { 
  auth, 
  db, 
  onAuthStateChanged, 
  googleProvider,
  analytics 
};