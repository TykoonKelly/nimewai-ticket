// src/pages/Cart.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  MapPin, 
  Ticket, 
  Lock,
  CheckCircle,
  Mail,
  User
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { ALL_EVENTS } from '../data/events';
import { getEventImage } from '../utils/eventImages';
import MpesaCheckoutModal from '../component/MpesaCheckoutModal';
import { auth, db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import mpesaService from '../services/mpesaService';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    removeItem, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [checkoutId, setCheckoutId] = useState(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestEmailPrompt, setShowGuestEmailPrompt] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const enrichedItems = items.map(cartItem => {
      const event = ALL_EVENTS.find(e => e.id === cartItem.eventId);
      let tierInfo = null;
      
      if (event && cartItem.levelName && cartItem.tierName) {
        const level = event.ticketLevels?.find(l => l.name === cartItem.levelName);
        const tier = level?.tiers.find(t => t.name === cartItem.tierName);
        tierInfo = { level, tier };
      }
      
      const price = Number(cartItem.price) || 0;
      const quantity = Number(cartItem.quantity) || 0;
      
      return {
        ...cartItem,
        event,
        tierInfo,
        image: getEventImage(cartItem.eventId),
        eventSlug: event ? `events/${event.id}` : '#',
        eventTitle: event?.title || 'Event',
        eventDate: event?.date || '',
        eventVenue: event?.venue || '',
        eventCity: event?.city || '',
        price: price,
        quantity: quantity,
        totalPrice: price * quantity,
        eventData: event
      };
    });
    
    setCartItems(enrichedItems);
    setLoading(false);
  }, [items]);

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Remove this item from your cart?')) {
      removeItem(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all items from your cart?')) {
      clearCart();
    }
  };

  /**
   * Get the authentication token for API calls
   */
  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  /**
   * Create order in Firebase before initiating payment
   * Uses the backend API with authentication
   */
  const createOrderInBackend = async (orderData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Please log in to continue');
      }

      const token = await getAuthToken();
      
      const response = await fetch('http://localhost:5000/api/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('✅ Order created:', data);
      return data;

    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  };

  /**
   * Handle guest checkout - create anonymous session
   */
  const createGuestSession = async () => {
    try {
      // First, check if we already have an anonymous user
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        console.log('✅ Already have guest session:', auth.currentUser.uid);
        return auth.currentUser;
      }

      // Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      const guestUser = userCredential.user;
      
      console.log('✅ Guest session created:', guestUser.uid);
      
      // Store guest info in Firestore
      const guestUserData = {
        uid: guestUser.uid,
        isGuest: true,
        createdAt: serverTimestamp(),
        role: 'guest',
        email: guestEmail || 'guest@temporary.com'
      };
      
      await setDoc(doc(db, 'users', guestUser.uid), guestUserData);
      console.log('✅ Guest user data saved to Firestore');
      
      setIsGuest(true);
      return guestUser;
      
    } catch (error) {
      console.error('❌ Error creating guest session:', error);
      throw error;
    }
  };

  /**
   * Handle checkout with guest support
   */
  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Check if user is logged in
    const user = auth.currentUser;
    
    // If not logged in, offer guest checkout option
    if (!user) {
      // Show email prompt first
      const emailInput = prompt(
        'You are checking out as a guest. Please enter your email address to receive your tickets:\n\n' +
        '(Your tickets will be sent to this email after successful payment)'
      );
      
      if (emailInput === null) {
        // User cancelled
        return;
      }
      
      // Validate email
      if (!emailInput || !emailInput.includes('@')) {
        alert('Please enter a valid email address to receive your tickets.');
        return;
      }
      
      setGuestEmail(emailInput);
      setShowGuestEmailPrompt(false);
      
      // Ask if they want to continue as guest
      const shouldContinueAsGuest = window.confirm(
        `📧 Tickets will be sent to: ${emailInput}\n\n` +
        'Would you like to continue as a guest?\n\n' +
        'Click "OK" to continue as guest, or "Cancel" to login/sign up.'
      );
      
      if (!shouldContinueAsGuest) {
        localStorage.setItem('redirectAfterLogin', '/cart');
        navigate('/login', { 
          state: { 
            from: '/cart',
            message: 'Please login to complete your purchase'
          } 
        });
        return;
      }
      
      // Create guest session
      try {
        await createGuestSession();
        console.log('✅ Guest session ready');
      } catch (guestError) {
        console.error('❌ Error creating guest session:', guestError);
        alert('Unable to create guest session. Please try logging in instead.');
        navigate('/login', { 
          state: { 
            from: '/cart',
            message: 'Please login to complete your purchase'
          } 
        });
        return;
      }
    }

    setIsCheckingOut(true);

    try {
      // First, check if backend is reachable
      const healthCheck = await mpesaService.checkBackendHealth();
      if (!healthCheck.success) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      }

      // Calculate totals
      const subtotal = getTotalPrice() || 0;
      const serviceFee = Math.round(subtotal * 0.05);
      const total = subtotal + serviceFee;

      const firstItem = cartItems[0];
      const event = firstItem.eventData;

      // Get user info - handle both logged-in and guest users
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid || 'guest_user';
      const userEmail = currentUser?.email || guestEmail || 'guest@temporary.com';
      const userName = currentUser?.displayName || 'Guest User';
      const isGuestUser = currentUser?.isAnonymous || false;

      // If guest, store email in Firestore
      if (isGuestUser && guestEmail) {
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            email: guestEmail,
            guestEmail: guestEmail
          });
          console.log('✅ Guest email saved to Firestore');
        } catch (updateError) {
          console.warn('Could not update guest email:', updateError);
        }
      }

      const orderData = {
        eventId: firstItem.eventId,
        eventTitle: firstItem.eventTitle,
        eventDate: firstItem.eventDate,
        eventVenue: firstItem.eventVenue,
        eventCity: firstItem.eventCity,
        eventCreatorId: event?.createdBy || 'user-1',
        quantity: getTotalItems(),
        totalPrice: total,
        email: userEmail,
        userName: userName,
        isGuest: isGuestUser,
        userId: userId,
        guestEmail: isGuestUser ? guestEmail : null,
        ticketDetails: cartItems.map(item => ({
          tierName: item.tierName,
          levelName: item.levelName,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('📝 Order data being sent:', orderData);

      const result = await mpesaService.createOrder(orderData);
      
      setCurrentOrderId(result.orderId);
      setCheckoutId(result.checkoutId);

      // Store guest user ID and email for later use
      if (isGuestUser) {
        sessionStorage.setItem('guestUserId', userId);
        sessionStorage.setItem('guestEmail', guestEmail);
      }

      setShowMpesaModal(true);
      
    } catch (error) {
      console.error('❌ Error during checkout:', error);
      
      // Show user-friendly error message
      let errorMessage = 'There was an error processing your order. Please try again.';
      if (error.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to the payment server. Please ensure the backend is running on port 5000.';
      } else if (error.message.includes('login')) {
        errorMessage = 'Please login again to continue.';
      } else if (error.message.includes('User not authenticated')) {
        errorMessage = 'Please login or continue as guest to complete your purchase.';
      }
      
      alert(errorMessage);
      setIsCheckingOut(false);
    }
  };

  const handleMpesaSuccess = async (paymentData) => {
    console.log('Payment successful:', paymentData);
    setPaymentSuccess(true);
    setShowMpesaModal(false);
    setIsCheckingOut(false);
    
    try {
      // Save guest email to session for success page
      if (guestEmail) {
        sessionStorage.setItem('guestEmail', guestEmail);
      }
      
      setTimeout(() => {
        clearCart();
        navigate('/payment-success', { 
          state: { 
            items: cartItems,
            paymentData: paymentData,
            orderId: currentOrderId,
            email: guestEmail || auth.currentUser?.email
          } 
        });
      }, 2000);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const handleMpesaError = (error) => {
    console.error('Payment error:', error);
    setIsCheckingOut(false);
  };

  const handleMpesaClose = () => {
    setShowMpesaModal(false);
    setIsCheckingOut(false);
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) return 'KES 0';
    return `KES ${numPrice.toLocaleString()}`;
  };

  const groupItemsByEvent = () => {
    const groups = {};
    cartItems.forEach(item => {
      const groupKey = item.eventId;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          eventId: item.eventId,
          event: item.event,
          items: [],
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          eventVenue: item.eventVenue,
          eventCity: item.eventCity,
          image: item.image,
          eventSlug: item.eventSlug,
        };
      }
      groups[groupKey].items.push(item);
    });
    return Object.values(groups);
  };

  const eventGroups = groupItemsByEvent();
  const totalItems = getTotalItems();
  const subtotal = getTotalPrice() || 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
        fontFamily: "'Manrope', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              height: '64px',
              width: '64px',
              border: '4px solid #7c3aed',
              borderTopColor: 'transparent'
            }}
          />
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
        fontFamily: "'Manrope', sans-serif",
        overflowX: 'hidden',
      }}>
        <NavSection />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{
            maxWidth: '448px',
            margin: '0 auto',
            borderRadius: '24px',
            border: '2px dashed #e5e7eb',
            background: 'rgba(255,255,255,0.5)',
            padding: '32px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '64px',
              width: '64px',
              margin: '0 auto',
              borderRadius: '50%',
              background: '#ede9fe',
              color: '#7c3aed'
            }}>
              <ShoppingBag size={32} />
            </div>
            <h2 style={{
              marginTop: '20px',
              fontSize: '22px',
              fontWeight: 800,
              color: '#111827'
            }}>
              Your cart is empty
            </h2>
            <p style={{
              marginTop: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Discover upcoming concerts, corporate summits and fitness sessions —
              then add tickets from any event page.
            </p>
            <Link
              to="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
                borderRadius: '9999px',
                background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.3s ease',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #6d28d9, #5b21b6)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Ticket size={16} />
              Browse events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      fontFamily: "'Manrope', sans-serif",
      overflowX: 'hidden',
      maxWidth: '100%',
    }}>
      <NavSection />

      {/* Guest Info Banner */}
      {!auth.currentUser && (
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          marginTop: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            padding: '12px 16px',
            border: '1px solid #f59e0b'
          }}>
            <Mail size={20} color="#d97706" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                <strong>Guest Checkout Available:</strong> You can purchase tickets without logging in. 
                Your tickets will be sent to the email you provide during payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '24px 12px',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div>
            <p style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#7c3aed'
            }}>
              Checkout
            </p>
            <h1 style={{
              marginTop: '4px',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#b8860b'
            }}>
              Your cart
            </h1>
            <p style={{
              marginTop: '4px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {totalItems === 0
                ? "No tickets yet — pick some to get started."
                : `${totalItems} ticket${totalItems === 1 ? "" : "s"} across ${eventGroups.length} event${eventGroups.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid #e5e7eb',
                background: 'rgba(255,255,255,0.8)',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b7280',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif",
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <Trash2 size={14} />
              Clear cart
            </button>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '24px',
        }} className="cart-grid">
          {/* Cart Items */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            width: '100%',
          }}>
            {eventGroups.map((group) => (
              <EventGroup 
                key={group.eventId}
                group={group} 
                onRemoveItem={handleRemoveItem}
                formatPrice={formatPrice}
              />
            ))}
          </div>

          {/* Order Summary */}
          <aside style={{ 
            alignSelf: 'stretch',
            width: '100%',
          }} className="cart-sidebar">
            <div style={{
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827'
              }}>
                Order summary
              </h3>

              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Service fee (5%)</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {formatPrice(serviceFee)}
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280'
                }}>
                  Total
                </span>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#7c3aed'
                }}>
                  {formatPrice(total)}
                </span>
              </div>

              {/* Guest Checkout Info */}
              {!auth.currentUser && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#d97706" />
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#92400e', 
                      margin: 0,
                      lineHeight: 1.4
                    }}>
                      <strong>Guest Checkout:</strong> You'll need to provide your email to receive tickets.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffffff',
                  border: 'none',
                  cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.3s ease',
                  opacity: isCheckingOut ? 0.5 : 1,
                  fontFamily: "'Manrope', sans-serif",
                  minHeight: '52px',
                }}
                onMouseEnter={(e) => {
                  if (!isCheckingOut) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #6d28d9, #5b21b6)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCheckingOut) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isCheckingOut ? (
                  <>
                    <div style={{
                      display: 'inline-block',
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '16px',
                      width: '16px',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent'
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Pay with M-Pesa
                  </>
                )}
              </button>

              <p style={{
                marginTop: '12px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#9ca3af'
              }}>
                Secure payment via M-Pesa. Tickets will be sent to your email.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* M-Pesa Checkout Modal */}
      <MpesaCheckoutModal
        isOpen={showMpesaModal}
        onClose={handleMpesaClose}
        amount={total}
        items={cartItems.map(item => ({
          ...item,
          name: item.tierName || 'Ticket',
          price: item.price,
        }))}
        onSuccess={handleMpesaSuccess}
        onError={handleMpesaError}
        checkoutId={checkoutId}
        guestEmail={guestEmail}
        isGuest={auth.currentUser?.isAnonymous || false}
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (min-width: 768px) {
            .decorative-blob {
              display: block !important;
            }
          }
          
          @media (min-width: 1024px) {
            .cart-grid {
              flex-direction: row !important;
              gap: 32px !important;
            }
            
            .cart-sidebar {
              align-self: flex-start !important;
              width: 380px !important;
              flex-shrink: 0 !important;
              position: sticky !important;
              top: 24px !important;
            }
            
            .cart-sidebar > div {
              width: 100% !important;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          .event-image {
            overflow: hidden !important;
          }
          
          .event-image img {
            max-width: 100% !important;
            height: auto !important;
          }
          
          @media (max-width: 640px) {
            button, 
            a,
            select,
            input {
              min-height: 44px !important;
            }
            
            .cart-grid {
              gap: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// Navigation Section Component
function NavSection() {
  const navigate = useNavigate();
  
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)',
      padding: '24px 12px',
    }}>
      <div style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        right: 0,
        height: '288px',
        width: '288px',
        transform: 'translateX(33%) translateY(-33%)',
        borderRadius: '50%',
        background: 'rgba(245, 158, 11, 0.3)',
        filter: 'blur(64px)',
        display: 'none',
      }}
      className="nav-decorative" />
      <div style={{
        pointerEvents: 'none',
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '288px',
        width: '288px',
        transform: 'translateX(-33%) translateY(33%)',
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.3)',
        filter: 'blur(64px)',
        display: 'none',
      }}
      className="nav-decorative" />
      
      <div style={{
        position: 'relative',
        maxWidth: '1280px',
        margin: '0 auto',
        color: '#ffffff'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Manrope', sans-serif",
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
        >
          <ArrowLeft size={14} />
          Keep browsing events
        </button>
        <div style={{ marginTop: '12px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#ffffff'
          }}>
            Your Cart
          </h1>
        </div>
      </div>

      <style>
        {`
          @media (min-width: 768px) {
            .nav-decorative {
              display: block !important;
            }
            section {
              padding: 32px 16px !important;
            }
            .nav-decorative + .nav-decorative {
              display: block !important;
            }
          }
        `}
      </style>
    </section>
  );
}

// Event Group Component
function EventGroup({ group, onRemoveItem, formatPrice }) {
  const { items, eventTitle, eventDate, eventVenue, eventCity, image, eventSlug } = group;
  const eventSubtotal = items.reduce((s, item) => s + (Number(item.price) || 0) * item.quantity, 0);

  return (
    <article style={{
      overflow: 'hidden',
      borderRadius: '20px',
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      width: '100%',
      maxWidth: '100%',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px',
      }} className="event-header">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%'
        }} className="event-header-inner">
          <div style={{
            position: 'relative',
            height: '120px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '12px',
            background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)',
            flexShrink: 0,
          }} className="event-image">
            {image ? (
              <img
                src={image}
                alt={`${eventTitle} poster`}
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)' }} />
            )}
          </div>
          
          <div style={{ 
            minWidth: 0, 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <Link
              to={eventSlug}
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#111827',
                textDecoration: 'none',
                transition: 'color 0.2s',
                lineHeight: 1.3,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
            >
              {eventTitle}
            </Link>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}>
              <Calendar size={12} />
              <span>{eventDate}</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span>{eventVenue}</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span>{eventCity}</span>
            </p>
          </div>
          
          <div style={{ 
            textAlign: 'left',
            marginTop: '4px',
          }}>
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280'
            }}>
              Event subtotal
            </p>
            <p style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#7c3aed'
            }}>
              {formatPrice(eventSubtotal)}
            </p>
          </div>
        </div>
      </div>

      <ul style={{ 
        listStyle: 'none', 
        margin: 0, 
        padding: 0,
        width: '100%',
      }}>
        {items.map((item, index) => {
          const itemPrice = Number(item.price) || 0;
          const itemTotal = itemPrice * item.quantity;
          
          return (
            <li
              key={item.id || `${item.eventId}-${item.tierName}-${index}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 16px',
                borderTop: '1px solid #f3f4f6',
                width: '100%',
                boxSizing: 'border-box',
              }}
              className="ticket-item"
            >
              <div style={{ 
                minWidth: 0, 
                flex: 1,
                width: '100%',
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  {item.tierName}
                </p>
                <p style={{
                  marginTop: '2px',
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexWrap: 'wrap',
                }}>
                  <Ticket size={12} />
                  <span>{item.levelName}</span>
                  <span style={{ color: '#d1d5db' }}>·</span>
                  <span>{formatPrice(itemPrice)} each</span>
                  <span style={{ color: '#d1d5db' }}>·</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>× {item.quantity}</span>
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '12px',
              }} className="ticket-controls">
                <div style={{
                  minWidth: '80px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#7c3aed'
                }}>
                  {formatPrice(itemTotal)}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.tierName} from cart`}
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    minWidth: '44px',
                    minHeight: '44px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'transparent',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <style>
        {`
          @media (min-width: 640px) {
            .event-header-inner {
              flex-direction: row !important;
              align-items: center !important;
              gap: 16px !important;
            }
            
            .event-image {
              width: 120px !important;
              height: 80px !important;
              flex-shrink: 0 !important;
            }
            
            .ticket-item {
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
              padding: 16px 20px !important;
            }
            
            .ticket-controls {
              flex: 0 1 auto !important;
              width: auto !important;
              justify-content: flex-end !important;
              gap: 16px !important;
            }
            
            .ticket-controls > div {
              text-align: right !important;
            }
          }
          
          @media (min-width: 768px) {
            .event-header {
              padding: 20px !important;
            }
            
            .event-header-inner {
              gap: 16px !important;
            }
          }
        `}
      </style>
    </article>
  );
}