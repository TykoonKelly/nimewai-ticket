// src/components/FeaturedEvents.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import EventCard from './EventCard';
import { ALL_EVENTS } from '../../data/events';
import { getCheapestActiveTier } from '../../utils/ticketUtils';

const FeaturedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from centralized data source
    setTimeout(() => {
      // Filter events that should be featured
      const featuredEvents = ALL_EVENTS
        .filter(event => {
          // You can add logic to determine which events are featured
          // For now, we'll use the first 3 events or events with specific tags
          return event.tag === 'Trending' || 
                 event.tag === 'Weekly' || 
                 event.tag === 'Almost Sold Out' ||
                 event.id <= 3; // Fallback
        })
        .map(event => ({
          ...event,
          // Ensure location field exists for compatibility
          location: event.location || `${event.venue}, ${event.city}`
        }));

      setEvents(featuredEvents);
      setLoading(false);
    }, 500);
  }, []);

  // Sort events: active events first, then by cheapest price
  const sortedEvents = [...events].sort((a, b) => {
    const aHasTickets = !!getCheapestActiveTier(a.ticketLevels);
    const bHasTickets = !!getCheapestActiveTier(b.ticketLevels);
    
    // Show events with tickets first
    if (aHasTickets && !bHasTickets) return -1;
    if (!aHasTickets && bHasTickets) return 1;
    
    // Then sort by cheapest price
    const aPrice = getCheapestActiveTier(a.ticketLevels)?.tier.price || Infinity;
    const bPrice = getCheapestActiveTier(b.ticketLevels)?.tier.price || Infinity;
    return aPrice - bPrice;
  });

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '64px 16px',
        background: 'linear-gradient(to bottom, #f9fafb, #ffffff)'
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: '33%',
          right: 0,
          height: '288px',
          width: '288px',
          transform: 'translateX(33%)',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.1)',
          filter: 'blur(80px)'
        }}
      />
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          bottom: '33%',
          left: 0,
          height: '288px',
          width: '288px',
          transform: 'translateX(-33%)',
          borderRadius: '50%',
          background: 'rgba(236, 72, 153, 0.1)',
          filter: 'blur(80px)'
        }}
      />
      
      <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '24px'
          }}
          className="featured-header"
        >
          <div style={{ maxWidth: '672px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#7c3aed',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <span
                style={{
                  height: '6px',
                  width: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#7c3aed',
                  animation: 'pulse 2s infinite'
                }}
              />
              Handpicked for you
            </span>
            <h2
              style={{
                marginTop: '16px',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '30px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#b8860b'
              }}
            >
              Featured Events This Season
            </h2>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                marginTop: '12px',
                fontSize: '16px',
                color: '#4b5563'
              }}
            >
              Curated experiences across entertainment, music, business and community — all in one place.
            </p>
          </div>
          <Link
            to="/events"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '9999px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.color = '#7c3aed';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#111827';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            View all events
            <ArrowUpRight style={{ height: '16px', width: '16px' }} />
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading amazing events...</p>
            </div>
          </div>
        ) : sortedEvents.length === 0 ? (
          /* Empty State */
          <div style={{ marginTop: '48px', textAlign: 'center', padding: '48px 0' }}>
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
              <Sparkles style={{ height: '40px', width: '40px', color: '#7c3aed' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>No featured events available</h3>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Check back later for upcoming events</p>
          </div>
        ) : (
          /* Events Grid */
          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gap: '24px',
              gridTemplateColumns: '1fr'
            }}
            className="featured-grid"
          >
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                featured={event.tag === 'Featured'}
              />
            ))}
          </div>
        )}

        {/* Optional: View More CTA at Bottom */}
        {!loading && sortedEvents.length > 0 && (
          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <Link
              to="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6d28d9';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7c3aed';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>Discover more events</span>
              <ArrowUpRight style={{ height: '16px', width: '16px' }} />
            </Link>
          </div>
        )}
      </div>

      {/* Add keyframe animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (min-width: 640px) {
            .featured-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (min-width: 1024px) {
            .featured-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
            .featured-header {
              flex-direction: row !important;
              align-items: flex-end !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default FeaturedEvents;