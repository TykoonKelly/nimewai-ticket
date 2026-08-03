// src/component/home/EventCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Flame } from 'lucide-react';
import EventImage from '../EventImage';
import { getEventImage } from '../../utils/eventImages.jsx';
import { 
  getCheapestActiveTier, 
  getPriceRangeDisplay,
  getTotalRemainingTickets,
  getTierPercentSold,
  getActiveTier
} from '../../utils/ticketUtils';

// Helper function to format date for the badge
const formatDateBadge = (dateStr) => {
  // Check if it's a recurring event (starts with "Every")
  if (dateStr && dateStr.toLowerCase().startsWith('every ')) {
    const dayOfWeek = dateStr.replace('Every ', '').trim();
    return {
      topText: 'every',
      bottomText: dayOfWeek.slice(0, 3).toUpperCase(),
      isRecurring: true
    };
  }
  
  // Regular date format (e.g., "July 25, 2026" or "July 18th, 2026")
  const parts = dateStr.split(' ');
  let month = parts[0]?.slice(0, 3) || '';
  let day = parts[1]?.replace(',', '').replace('th', '').replace('nd', '').replace('rd', '').replace('st', '') || '';
  
  return {
    topText: month,
    bottomText: day,
    isRecurring: false
  };
};

// Helper function to format date for display
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  return dateStr;
};

// Determine tag color
const getTagColor = (tag) => {
  const colors = {
    'Almost Sold Out': '#ef4444',
    'Trending': '#8b5cf6',
    'Featured': '#f59e0b',
    'New': '#10b981',
    'Weekly': '#3b82f6',
    'Corporate': '#6366f1',
    'Hot': '#f43f5e',
    'Networking': '#8b5cf6',
    'Family': '#f59e0b'
  };
  return colors[tag] || '#6b7280';
};

const EventCard = ({ event, featured = false }) => {
  const navigate = useNavigate();
  const dateBadge = formatDateBadge(event.date);
  const displayDate = formatDateDisplay(event.date);
  
  // Get event image from centralized mapping
  const eventImage = getEventImage(event.id);
  
  // Ticket tier calculations
  const cheapestTier = event.ticketLevels ? getCheapestActiveTier(event.ticketLevels) : null;
  const totalRemaining = event.ticketLevels ? getTotalRemainingTickets(event.ticketLevels) : 0;
  const priceDisplay = event.ticketLevels ? getPriceRangeDisplay(event.ticketLevels) : (event.priceDisplay || `KES ${event.price?.toLocaleString()}`);
  
  // Get all active tiers for display
  const activeTiers = [];
  if (event.ticketLevels) {
    event.ticketLevels.forEach(level => {
      const active = getActiveTier(level.tiers);
      if (active) {
        activeTiers.push({
          level: level.name,
          tier: active,
          percentSold: getTierPercentSold(active)
        });
      }
    });
  }

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent double navigation
    navigate(`/events/${event.id}`);
  };

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '24px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        height: '100%',
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 58, 237, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      {/* Removed the outer Link wrapper - now using onClick on the article */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Visual Header with Image Support */}
        <EventImage
          src={eventImage}
          alt={event.title}
          gradient={event.gradient}
        >
          {/* Category Badge */}
          <div style={{ position: 'absolute', left: '16px', top: '16px', zIndex: 2 }}>
            <span
              style={{
                borderRadius: '9999px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: "'Manrope', sans-serif",
                color: '#7c3aed',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {event.category}
            </span>
          </div>
          
          {/* Tag Badge */}
          {event.tag && (
            <div style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 2 }}>
              <span
                style={{
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif",
                  color: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  backgroundColor: getTagColor(event.tag),
                }}
              >
                {event.tag}
              </span>
            </div>
          )}
          
          {/* Featured Badge */}
          {featured && !event.tag && (
            <div style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 2 }}>
              <span
                style={{
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif",
                  color: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  backgroundColor: '#f59e0b',
                }}
              >
                Featured
              </span>
            </div>
          )}
          
          {/* Date Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '56px',
              minWidth: '56px',
              padding: '6px 10px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#111827',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
            }}
          >
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              color: dateBadge.isRecurring ? '#ef4444' : '#7c3aed', 
              fontFamily: "'Manrope', sans-serif",
              lineHeight: 1.2,
              letterSpacing: '0.5px'
            }}>
              {dateBadge.topText}
            </span>
            <span style={{ 
              fontSize: '20px', 
              fontWeight: 800, 
              lineHeight: 1.2, 
              fontFamily: "'Manrope', sans-serif",
              marginTop: '1px'
            }}>
              {dateBadge.bottomText}
            </span>
          </div>

          {/* Remaining Tickets Badge - Only show if low stock */}
          {totalRemaining > 0 && totalRemaining <= 50 && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                backdropFilter: 'blur(4px)',
                zIndex: 2,
              }}
            >
              <Flame size={14} />
              {totalRemaining} left
            </div>
          )}
        </EventImage>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '12px', padding: '20px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              color: '#111827',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
            onMouseLeave={(e) => e.target.style.color = '#111827'}
          >
            {event.title}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#6b7280', fontFamily: "'Manrope', sans-serif" }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ height: '16px', width: '16px', color: '#7c3aed', flexShrink: 0 }} />
              {displayDate} · {event.time}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ height: '16px', width: '16px', color: '#7c3aed', flexShrink: 0 }} />
              {event.location || `${event.venue}, ${event.city}`}
            </p>
          </div>

          {/* Ticket Levels Quick View - Only show if event has ticket levels */}
          {activeTiers.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {activeTiers.slice(0, 3).map(({ level, tier, percentSold }) => (
                  <span
                    key={level}
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: percentSold >= 70 ? '#fef3c7' : '#f3e8ff',
                      color: percentSold >= 70 ? '#d97706' : '#7c3aed',
                      fontWeight: 600,
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    {level}: {tier.name} · {percentSold}%
                  </span>
                ))}
                {activeTiers.length > 3 && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      fontWeight: 600,
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    +{activeTiers.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '16px',
            }}
          >
            <div>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontFamily: "'Manrope', sans-serif" }}>
                {cheapestTier ? 'From' : 'Status'}
              </p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: cheapestTier ? '#111827' : '#ef4444', fontFamily: "'Manrope', sans-serif" }}>
                {cheapestTier ? priceDisplay : 'Sold Out'}
              </p>
            </div>
            {/* Button as a Link with stopPropagation to prevent double navigation */}
            <Link
              to={`/events/${event.id}`}
              onClick={handleButtonClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '9999px',
                backgroundColor: cheapestTier ? '#7c3aed' : '#9ca3af',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: "'Manrope', sans-serif",
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: cheapestTier ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none',
                transition: 'all 0.3s ease',
                cursor: cheapestTier ? 'pointer' : 'default',
                pointerEvents: cheapestTier ? 'auto' : 'none',
                zIndex: 3,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (cheapestTier) {
                  e.currentTarget.style.backgroundColor = '#6d28d9';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (cheapestTier) {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <Ticket style={{ height: '14px', width: '14px' }} />
              {cheapestTier ? 'Buy now' : 'Sold Out'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EventCard;