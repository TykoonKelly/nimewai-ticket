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
      
      // Calculate the total price for this item
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

  // Group items by event
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

  // Calculate totals
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
        fontFamily: "'Manrope', sans-serif"
      }}>
        <NavSection />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{
            maxWidth: '448px',
            margin: '0 auto',
            borderRadius: '24px',
            border: '2px dashed #e5e7eb',
            background: 'rgba(255,255,255,0.5)',
            padding: '40px',
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
              fontSize: '24px',
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
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.3s ease'
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
      fontFamily: "'Manrope', sans-serif"
    }}>
      {/* Background decorative elements */}
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
          zIndex: 0
        }}
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
          zIndex: 0
        }}
      />

      {/* Header Section */}
      <NavSection />

      {/* Cart Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
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
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#b8860b'
            }}>
              Your cart
            </h1>
            <p style={{
              marginTop: '8px',
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
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif"
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

        <div style={{ display: 'grid', gap: '32px' }} className="cart-grid">
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <aside style={{ alignSelf: 'flex-start' }} className="cart-sidebar">
            <div style={{
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827'
              }}>
                Order summary
              </h3>

              <div style={{ marginTop: '20px' }}>
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
                  fontSize: '24px',
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
                  marginTop: '20px',
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                  border: 'none',
                  cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.3s ease',
                  opacity: isCheckingOut ? 0.5 : 1,
                  fontFamily: "'Manrope', sans-serif"
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

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (min-width: 1024px) {
            .cart-grid {
              grid-template-columns: 1fr 380px !important;
            }
            .cart-sidebar {
              position: sticky !important;
              top: 24px !important;
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
      padding: '32px 16px'
    }}>
      {/* Decorative elements */}
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
        filter: 'blur(64px)'
      }} />
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
        filter: 'blur(64px)'
      }} />
      
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
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ffffff',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Manrope', sans-serif"
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
        <div style={{ marginTop: '16px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#ffffff'
          }}>
            Your Cart
          </h1>
        </div>
      </div>
    </section>
  );
}

// Event Group Component - Simplified without quantity controls
function EventGroup({ group, onRemoveItem, formatPrice }) {
  const { items, eventTitle, eventDate, eventVenue, eventCity, image, eventSlug } = group;
  const eventSubtotal = items.reduce((s, item) => s + (Number(item.price) || 0) * item.quantity, 0);

  return (
    <article style={{
      overflow: 'hidden',
      borderRadius: '24px',
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}>
      {/* Event Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px'
      }} className="event-header">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%'
        }} className="event-header-inner">
          <div style={{
            position: 'relative',
            height: '96px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '16px',
            background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)'
          }} className="event-image">
            {image ? (
              <img
                src={image}
                alt={`${eventTitle} poster`}
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)' }} />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Link
              to={eventSlug}
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#111827',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
            >
              {eventTitle}
            </Link>
            <p style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={12} />
              {eventDate} · {eventVenue}, {eventCity}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
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
              fontSize: '16px',
              fontWeight: 800,
              color: '#111827'
            }}>
              {formatPrice(eventSubtotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Items - Simplified without quantity controls */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, index) => {
          const itemPrice = Number(item.price) || 0;
          const itemTotal = itemPrice * item.quantity;
          
          return (
            <li
              key={item.id || `${item.eventId}-${item.tierName}-${index}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px 20px',
                borderTop: '1px solid #f3f4f6'
              }}
              className="ticket-item"
            >
              <div style={{ minWidth: 0, flex: 1 }}>
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
                  gap: '4px'
                }}>
                  <Ticket size={12} />
                  {item.levelName} · {formatPrice(itemPrice)} each · 
                  <span style={{ fontWeight: 600, color: '#111827' }}>× {item.quantity}</span>
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }} className="ticket-controls">
                <div style={{
                  minWidth: '80px',
                  textAlign: 'right',
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
                    width: '36px',
                    height: '36px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'transparent',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
            }
            .event-image {
              width: 128px !important;
              height: 80px !important;
            }
            .ticket-item {
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
            }
            .ticket-controls {
              flex: 1 !important;
              justify-content: flex-end !important;
            }
          }
        `}
      </style>
    </article>
  );
}