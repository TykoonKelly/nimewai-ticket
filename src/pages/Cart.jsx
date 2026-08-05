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
  CheckCircle
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { ALL_EVENTS } from '../data/events';
import { getEventImage } from '../utils/eventImages';

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
        totalPrice: price * quantity
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

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      console.log('Proceeding to checkout with items:', items);
    }, 1500);
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
            padding: '32px 20px', // FIXED: Better mobile padding
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
              fontSize: '22px', // FIXED: Smaller on mobile
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
                fontSize: '16px', // FIXED: Larger for touch
                fontWeight: 700,
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.3s ease',
                minHeight: '48px', // FIXED: Touch-friendly
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
      overflowX: 'hidden', // FIXED: Prevent horizontal scroll
      maxWidth: '100%',
    }}>
      {/* Background decorative elements - FIXED: Hide on mobile */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: '20%',
          right: 0,
          height: '288px',
          width: '288px',
          transform: 'translateX(33%)',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.1)',
          filter: 'blur(80px)',
          zIndex: 0,
          display: 'none', // FIXED: Hidden on mobile
        }}
        className="decorative-blob"
      />
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          bottom: '20%',
          left: 0,
          height: '288px',
          width: '288px',
          transform: 'translateX(-33%)',
          borderRadius: '50%',
          background: 'rgba(236, 72, 153, 0.1)',
          filter: 'blur(80px)',
          zIndex: 0,
          display: 'none', // FIXED: Hidden on mobile
        }}
        className="decorative-blob"
      />

      {/* Header Section */}
      <NavSection />

      {/* Cart Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '24px 12px', // FIXED: Reduced padding on mobile
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', // FIXED: Stack on mobile
          alignItems: 'flex-start', // FIXED: Left align on mobile
          gap: '12px', // FIXED: Gap between elements
          marginBottom: '24px', // FIXED: Reduced margin
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
              fontSize: '24px', // FIXED: Smaller on mobile
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#b8860b'
            }}>
              Your cart
            </h1>
            <p style={{
              marginTop: '4px', // FIXED: Reduced margin
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
                padding: '10px 16px', // FIXED: Larger touch target
                fontSize: '14px', // FIXED: Larger for touch
                fontWeight: 600,
                color: '#6b7280',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif",
                minHeight: '44px', // FIXED: Touch-friendly
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
          flexDirection: 'column', // FIXED: Stack on mobile
          gap: '24px', // FIXED: Reduced gap
        }} className="cart-grid">
          {/* Cart Items */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', // FIXED: Reduced gap
            width: '100%', // FIXED: Full width
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

          {/* Order Summary - FIXED: Full width on mobile */}
          <aside style={{ 
            alignSelf: 'stretch', // FIXED: Full width
            width: '100%', // FIXED: Full width
          }} className="cart-sidebar">
            <div style={{
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '20px', // FIXED: Better padding
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              width: '100%', // FIXED: Full width
              boxSizing: 'border-box',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827'
              }}>
                Order summary
              </h3>

              <div style={{ marginTop: '16px' }}> {/* FIXED: Reduced margin */}
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
                  fontSize: '22px', // FIXED: Slightly smaller on mobile
                  fontWeight: 800,
                  color: '#7c3aed'
                }}>
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                style={{
                  marginTop: '16px', // FIXED: Reduced margin
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                  padding: '14px 20px', // FIXED: Larger touch target
                  fontSize: '16px', // FIXED: Larger for touch
                  fontWeight: 700,
                  color: '#ffffff',
                  border: 'none',
                  cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.3s ease',
                  opacity: isCheckingOut ? 0.5 : 1,
                  fontFamily: "'Manrope', sans-serif",
                  minHeight: '52px', // FIXED: Touch-friendly
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
                    Secure checkout
                  </>
                )}
              </button>

              <p style={{
                marginTop: '12px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#9ca3af'
              }}>
                QR tickets delivered instantly to your email.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* FIXED: Comprehensive responsive styles */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* FIXED: Show decorative blobs on tablet/desktop */
          @media (min-width: 768px) {
            .decorative-blob {
              display: block !important;
            }
          }
          
          /* FIXED: Desktop grid layout */
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
            
            .cart-items-container {
              flex: 1 !important;
            }
          }
          
          /* FIXED: Prevent any overflow */
          * {
            box-sizing: border-box;
          }
          
          /* FIXED: Ensure images don't overflow */
          .event-image {
            overflow: hidden !important;
          }
          
          .event-image img {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* FIXED: Better touch targets on mobile */
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

// Navigation Section Component - FIXED: Better mobile padding
function NavSection() {
  const navigate = useNavigate();
  
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)',
      padding: '24px 12px', // FIXED: Better mobile padding
    }}>
      {/* Decorative elements - FIXED: Hidden on mobile */}
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
        display: 'none', // FIXED: Hidden on mobile
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
        display: 'none', // FIXED: Hidden on mobile
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
            padding: '8px 16px', // FIXED: Larger touch target
            fontSize: '14px', // FIXED: Larger for touch
            fontWeight: 600,
            color: '#ffffff',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Manrope', sans-serif",
            minHeight: '44px', // FIXED: Touch-friendly
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
        <div style={{ marginTop: '12px' }}> {/* FIXED: Reduced margin */}
          <h1 style={{
            fontSize: '22px', // FIXED: Smaller on mobile
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#ffffff'
          }}>
            Your Cart
          </h1>
        </div>
      </div>

      {/* FIXED: Show decorations on tablet/desktop */}
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

// Event Group Component - FIXED: Better mobile layout
function EventGroup({ group, onRemoveItem, formatPrice }) {
  const { items, eventTitle, eventDate, eventVenue, eventCity, image, eventSlug } = group;
  const eventSubtotal = items.reduce((s, item) => s + (Number(item.price) || 0) * item.quantity, 0);

  return (
    <article style={{
      overflow: 'hidden',
      borderRadius: '20px', // FIXED: Smaller radius on mobile
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      width: '100%', // FIXED: Full width
      maxWidth: '100%', // FIXED: Prevent overflow
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      {/* Event Header - FIXED: Better mobile layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px', // FIXED: Reduced gap
        borderBottom: '1px solid #e5e7eb',
        padding: '16px', // FIXED: Better padding
      }} className="event-header">
        <div style={{
          display: 'flex',
          flexDirection: 'column', // Mobile: stack vertically
          gap: '12px', // FIXED: Reduced gap
          width: '100%'
        }} className="event-header-inner">
          {/* Event Image - FIXED: Better sizing */}
          <div style={{
            position: 'relative',
            height: '120px', // FIXED: Fixed height on mobile
            width: '100%',
            overflow: 'hidden',
            borderRadius: '12px', // FIXED: Smaller radius
            background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)',
            flexShrink: 0, // FIXED: Prevent shrinking
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
          
          {/* Event Info - FIXED: Better layout */}
          <div style={{ 
            minWidth: 0, 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px', // FIXED: Tighter spacing
          }}>
            <Link
              to={eventSlug}
              style={{
                fontSize: '16px', // FIXED: Smaller on mobile
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
              gap: '6px', // FIXED: Smaller gap
              flexWrap: 'wrap', // FIXED: Wrap on small screens
            }}>
              <Calendar size={12} />
              <span>{eventDate}</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span>{eventVenue}</span>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span>{eventCity}</span>
            </p>
          </div>
          
          {/* Event Subtotal - FIXED: Better alignment */}
          <div style={{ 
            textAlign: 'left', // FIXED: Left align on mobile
            marginTop: '4px', // FIXED: Small margin
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
              fontSize: '18px', // FIXED: Slightly larger
              fontWeight: 800,
              color: '#7c3aed'
            }}>
              {formatPrice(eventSubtotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Items - FIXED: Better mobile layout */}
      <ul style={{ 
        listStyle: 'none', 
        margin: 0, 
        padding: 0,
        width: '100%', // FIXED: Full width
      }}>
        {items.map((item, index) => {
          const itemPrice = Number(item.price) || 0;
          const itemTotal = itemPrice * item.quantity;
          
          return (
            <li
              key={item.id || `${item.eventId}-${item.tierName}-${index}`}
              style={{
                display: 'flex',
                flexDirection: 'column', // Mobile: stack vertically
                gap: '8px', // FIXED: Reduced gap
                padding: '12px 16px', // FIXED: Better padding
                borderTop: '1px solid #f3f4f6',
                width: '100%',
                boxSizing: 'border-box',
              }}
              className="ticket-item"
            >
              <div style={{ 
                minWidth: 0, 
                flex: 1,
                width: '100%', // FIXED: Full width
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
                  flexWrap: 'wrap', // FIXED: Wrap on small screens
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
                justifyContent: 'space-between', // FIXED: Space between
                width: '100%', // FIXED: Full width
                gap: '12px',
              }} className="ticket-controls">
                <div style={{
                  minWidth: '80px',
                  textAlign: 'left', // FIXED: Left align on mobile
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
                    minWidth: '44px', // FIXED: Touch-friendly
                    minHeight: '44px', // FIXED: Touch-friendly
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'transparent',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: '8px', // FIXED: Better padding
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

      {/* FIXED: Responsive styles for EventGroup */}
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