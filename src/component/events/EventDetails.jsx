// src/component/events/EventDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  ArrowLeft,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CheckCircle,
  Users
} from 'lucide-react';
import { ALL_EVENTS } from '../../data/events';
import { getEventImage } from '../../utils/eventImages';
import { 
  getCheapestActiveTier,
  getTierStatus,
  getTierPercentSold
} from '../../utils/ticketUtils';
import { useCart } from '../../hooks/useCart';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantityError, setQuantityError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const { addItem, isInCart, getItemQuantity, getTotalItems } = useCart();

  useEffect(() => {
    const foundEvent = ALL_EVENTS.find(e => e.id === parseInt(id));
    if (foundEvent) {
      setEvent(foundEvent);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (event) {
      const initialSelected = {};
      event.ticketLevels?.forEach(level => {
        level.tiers.forEach(tier => {
          const key = `${level.name}-${tier.name}`;
          const cartQty = getItemQuantity(event.id, level.name, tier.name);
          if (cartQty > 0) {
            initialSelected[key] = cartQty;
          }
        });
      });
      setSelectedTickets(initialSelected);
    }
  }, [event, getItemQuantity]);

  // Get all available tiers flattened with their level info
  const getAllTiers = () => {
    if (!event?.ticketLevels) return [];
    const tiers = [];
    event.ticketLevels.forEach(level => {
      level.tiers.forEach(tier => {
        tiers.push({
          ...tier,
          levelName: level.name,
          levelIndex: event.ticketLevels.indexOf(level),
          tierIndex: level.tiers.indexOf(tier),
          status: getTierStatus(tier),
          percentSold: getTierPercentSold(tier)
        });
      });
    });
    return tiers;
  };

  const allTiers = getAllTiers();

  const handlePrevTier = () => {
    setActiveTierIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTier = () => {
    setActiveTierIndex(prev => Math.min(allTiers.length - 1, prev + 1));
  };

  const handleQuantityChange = (levelName, tierName, value) => {
    const key = `${levelName}-${tierName}`;
    
    const tier = event.ticketLevels
      .find(l => l.name === levelName)
      ?.tiers.find(t => t.name === tierName);
    
    if (!tier) {
      console.error('Tier not found:', levelName, tierName);
      return;
    }
    
    const maxAvailable = tier.quantity - tier.sold;
    const cartQty = getItemQuantity(event.id, levelName, tierName);
    const totalQuantity = value + cartQty;
    
    if (totalQuantity > maxAvailable) {
      setQuantityError(`Only ${maxAvailable} tickets available for ${tierName}`);
      return;
    }
    
    if (value < 0) {
      setQuantityError('Quantity cannot be negative');
      return;
    }
    
    setQuantityError('');
    
    setSelectedTickets(prev => {
      const updated = {
        ...prev,
        [key]: value
      };
      return updated;
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    
    Object.entries(selectedTickets).forEach(([key, qty]) => {
      if (qty > 0) {
        // Find the first hyphen that separates level and tier
        const hyphenIndex = key.indexOf('-');
        if (hyphenIndex === -1) return;
        
        const levelName = key.substring(0, hyphenIndex);
        const tierName = key.substring(hyphenIndex + 1);
        
        const tier = event.ticketLevels
          .find(l => l.name === levelName)
          ?.tiers.find(t => t.name === tierName);
        
        if (tier) {
          const price = Number(tier.price);
          if (!isNaN(price) && price > 0) {
            total += price * qty;
          }
        }
      }
    });
    
    return total;
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = () => {
    const totalTickets = getTotalTickets();
    
    if (totalTickets === 0) {
      setQuantityError('Please select at least one ticket');
      return;
    }

    let addedCount = 0;
    const itemsToAdd = [];

    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      if (quantity > 0) {
        // Find the first hyphen that separates level and tier
        const hyphenIndex = key.indexOf('-');
        if (hyphenIndex === -1) return;
        
        const levelName = key.substring(0, hyphenIndex);
        const tierName = key.substring(hyphenIndex + 1);
        
        const tier = event.ticketLevels
          .find(l => l.name === levelName)
          ?.tiers.find(t => t.name === tierName);
        
        if (tier) {
          const price = Number(tier.price);
          if (!isNaN(price) && price > 0) {
            itemsToAdd.push({
              eventId: event.id,
              levelName,
              tierName,
              price,
              quantity
            });
            addedCount++;
          }
        }
      }
    });

    if (addedCount === 0) {
      setQuantityError('Failed to add tickets to cart. Please try again.');
      return;
    }

    itemsToAdd.forEach(item => {
      addItem(item.eventId, item.levelName, item.tierName, item.price, item.quantity);
    });

    setSelectedTickets({});
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);

    navigate('/cart');
  };

  const isTicketInCart = (levelName, tierName) => {
    return isInCart(event.id, levelName, tierName);
  };

  const getTicketCartQuantity = (levelName, tierName) => {
    return getItemQuantity(event.id, levelName, tierName);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.toLowerCase().startsWith('every ')) {
      return dateStr;
    }
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('-')) {
      return timeStr;
    }
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

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
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
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
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80px',
              width: '80px',
              borderRadius: '50%',
              backgroundColor: '#ede9fe',
              marginBottom: '16px'
            }}
          >
            <Ticket style={{ height: '40px', width: '40px', color: '#7c3aed' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Event Not Found</h2>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>The event you're looking for doesn't exist.</p>
          <Link 
            to="/events" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '24px',
              borderRadius: '9999px',
              backgroundColor: '#7c3aed',
              padding: '12px 32px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowLeft size={20} />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const cheapestTier = getCheapestActiveTier(event.ticketLevels);
  const totalTickets = getTotalTickets();
  const totalPrice = getTotalPrice();
  const cartTotalItems = getTotalItems();

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

      {/* Top Navigation */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
              fontFamily: "'Manrope', sans-serif"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#7c3aed'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartTotalItems > 0 && (
              <Link 
                to="/cart" 
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '9999px',
                  transition: 'background 0.2s',
                  color: '#6b7280'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ShoppingBag size={18} />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartTotalItems}
                </span>
              </Link>
            )}
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              style={{
                padding: '8px',
                borderRadius: '9999px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                color: isWishlisted ? '#ef4444' : '#6b7280'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>
            <button 
              style={{
                padding: '8px',
                borderRadius: '9999px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                color: '#6b7280'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="event-detail-grid">
          {/* Left Column - Event Poster & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Hero Image */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#f3f4f6',
              aspectRatio: '3/4'
            }}>
              <img 
                src={getEventImage(event.id)} 
                alt={event.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              
              {/* Event Tags */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px'
              }}>
                <span style={{
                  padding: '4px 12px',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#7c3aed'
                }}>
                  {event.category}
                </span>
                {event.tag && (
                  <span style={{
                    padding: '4px 12px',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#111827'
                  }}>
                    {event.tag}
                  </span>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {formatDate(event.date)}
                </p>
                <h1 style={{
                  marginTop: '4px',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#b8860b',
                  letterSpacing: '-0.025em'
                }}>
                  {event.title}
                </h1>
                <p style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: 1.6
                }}>
                  {event.description || 'Join us for an unforgettable experience.'}
                </p>
              </div>

              {/* Date & Location */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Calendar size={18} style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Date and time
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      {formatDate(event.date)}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{formatTime(event.time)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '8px' }}>
                  <MapPin size={18} style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Location
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{event.venue}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{event.city}, Kenya</p>
                  </div>
                </div>
              </div>

              {/* Organizer */}
              {event.organizer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <Users size={16} style={{ color: '#6b7280' }} />
                  <span style={{ color: '#6b7280' }}>Organized by</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{event.organizer.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Ticket Selector */}
          <div>
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#6b7280'
                  }}>
                    Select Tickets
                  </h2>
                  {cheapestTier && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280'
                    }}>
                      From KES {cheapestTier.tier.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Ticket Carousel */}
                {allTiers.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div 
                        style={{
                          display: 'flex',
                          transition: 'transform 0.5s ease-in-out',
                          transform: `translateX(-${activeTierIndex * 100}%)`
                        }}
                      >
                        {allTiers.map((tier, index) => {
                          const isActive = tier.status === 'on_sale';
                          const remaining = tier.quantity - tier.sold;
                          const key = `${tier.levelName}-${tier.name}`;
                          const quantity = selectedTickets[key] || 0;
                          const inCart = isTicketInCart(tier.levelName, tier.name);
                          const cartQty = getTicketCartQuantity(tier.levelName, tier.name);
                          const price = Number(tier.price) || 0;

                          return (
                            <div 
                              key={`${tier.levelName}-${tier.name}`}
                              style={{ width: '100%', flexShrink: 0, padding: '0 4px' }}
                            >
                              <div style={{
                                background: '#f9fafb',
                                borderRadius: '16px',
                                padding: '24px',
                                border: inCart ? '2px solid #10b981' : '1px solid #e5e7eb'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                  <div>
                                    <p style={{
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      color: '#6b7280',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}>
                                      {tier.levelName}
                                    </p>
                                    <p style={{
                                      fontSize: '18px',
                                      fontWeight: 700,
                                      color: '#111827'
                                    }}>
                                      {tier.name} ticket
                                    </p>
                                  </div>
                                  <p style={{
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    color: '#7c3aed'
                                  }}>
                                    KES {price.toLocaleString()}
                                  </p>
                                </div>

                                {/* Status & Progress */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {isActive && (
                                    <>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: '#6b7280' }}>Available</span>
                                        <span style={{ color: '#6b7280' }}>{remaining} left</span>
                                      </div>
                                      <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '6px' }}>
                                        <div 
                                          style={{
                                            width: `${tier.percentSold}%`,
                                            background: 'linear-gradient(to right, #7c3aed, #8b5cf6)',
                                            height: '6px',
                                            borderRadius: '9999px',
                                            transition: 'width 0.3s ease'
                                          }}
                                        />
                                      </div>
                                    </>
                                  )}
                                  {tier.status === 'sold_out' && (
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '4px 12px',
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      borderRadius: '9999px'
                                    }}>
                                      Sold Out
                                    </span>
                                  )}
                                  {tier.status === 'upcoming' && (
                                    <div>
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: '#fef3c7',
                                        color: '#d97706',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        borderRadius: '9999px'
                                      }}>
                                        Coming Soon
                                      </span>
                                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                        Opens {new Date(tier.salesStart).toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                  {inCart && (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 12px',
                                      background: '#d1fae5',
                                      color: '#065f46',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      borderRadius: '9999px'
                                    }}>
                                      <CheckCircle size={12} />
                                      In Cart ({cartQty})
                                    </span>
                                  )}
                                </div>

                                {/* Quantity Selector */}
                                {isActive && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '16px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #e5e7eb'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <button
                                        onClick={() => handleQuantityChange(tier.levelName, tier.name, Math.max(0, quantity - 1))}
                                        disabled={quantity <= 0}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '9999px',
                                          border: '1px solid #d1d5db',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: 'white',
                                          cursor: quantity <= 0 ? 'not-allowed' : 'pointer',
                                          opacity: quantity <= 0 ? 0.5 : 1,
                                          transition: 'all 0.2s',
                                          fontSize: '16px',
                                          fontWeight: 500,
                                          color: '#374151'
                                        }}
                                      >
                                        −
                                      </button>
                                      <span style={{
                                        width: '32px',
                                        textAlign: 'center',
                                        fontWeight: 700,
                                        color: '#111827'
                                      }}>
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={() => handleQuantityChange(tier.levelName, tier.name, quantity + 1)}
                                        disabled={quantity + cartQty >= remaining}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '9999px',
                                          border: '1px solid #d1d5db',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: 'white',
                                          cursor: quantity + cartQty >= remaining ? 'not-allowed' : 'pointer',
                                          opacity: quantity + cartQty >= remaining ? 0.5 : 1,
                                          transition: 'all 0.2s',
                                          fontSize: '16px',
                                          fontWeight: 500,
                                          color: '#374151'
                                        }}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>
                                      × {quantity || 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {allTiers.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevTier}
                          disabled={activeTierIndex === 0}
                          style={{
                            position: 'absolute',
                            left: '-16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '9999px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: activeTierIndex === 0 ? 'not-allowed' : 'pointer',
                            opacity: activeTierIndex === 0 ? 0.3 : 1,
                            transition: 'all 0.2s'
                          }}
                        >
                          <ChevronLeft size={18} style={{ color: '#374151' }} />
                        </button>
                        <button
                          onClick={handleNextTier}
                          disabled={activeTierIndex === allTiers.length - 1}
                          style={{
                            position: 'absolute',
                            right: '-16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '9999px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: activeTierIndex === allTiers.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: activeTierIndex === allTiers.length - 1 ? 0.3 : 1,
                            transition: 'all 0.2s'
                          }}
                        >
                          <ChevronRight size={18} style={{ color: '#374151' }} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Tier Dots */}
                {allTiers.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    {allTiers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTierIndex(index)}
                        style={{
                          height: '6px',
                          borderRadius: '9999px',
                          transition: 'all 0.3s ease',
                          background: index === activeTierIndex ? '#7c3aed' : '#d1d5db',
                          width: index === activeTierIndex ? '24px' : '6px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Swipe Indicator */}
                {allTiers.length > 1 && (
                  <p style={{
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '12px'
                  }}>
                    Swipe for tiers
                  </p>
                )}

                {/* Error Message */}
                {quantityError && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#dc2626'
                  }}>
                    {quantityError}
                  </div>
                )}

                {/* Success Message */}
                {addedToCart && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#d1fae5',
                    border: '1px solid #6ee7b7',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} />
                    Tickets added to cart!
                  </div>
                )}

                {/* Order Summary */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Order
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed' }}>
                      KES {totalPrice > 0 ? totalPrice.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Selected
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                      {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {totalTickets > 0 ? (
                    <button
                      onClick={handleCheckout}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontFamily: "'Manrope', sans-serif"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, #6d28d9, #5b21b6)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <ShoppingBag size={18} />
                      Add to Cart & Checkout
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#e5e7eb',
                        color: '#9ca3af',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'not-allowed',
                        fontFamily: "'Manrope', sans-serif"
                      }}
                    >
                      Select tickets to proceed
                    </button>
                  )}
                </div>

                {!cheapestTier && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <p style={{ fontWeight: 500 }}>No tickets available</p>
                    <p style={{ fontSize: '12px' }}>Check back later for updates</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (min-width: 1024px) {
            .event-detail-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}