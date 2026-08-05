// src/pages/Events.jsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Ticket, SlidersHorizontal } from 'lucide-react';
import EventImage from '../component/EventImage';
import { getEventImage } from '../utils/eventImages.jsx';
import EventCard from '../component/home/EventCard.jsx';
import { ALL_EVENTS } from '../data/events.js';
import { getCheapestActiveTier } from '../utils/ticketUtils.jsx';

const CATEGORIES = ["All", "Entertainment", "Fitness", "HangOut"];
const CITIES = ["All cities", "Mbaazi Rd", "Limuru", "Nairobi", "Kiambu"];

const Events = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All cities");

  const filtered = useMemo(() => {
    return ALL_EVENTS.filter((e) => {
      const matchesQuery =
        !query ||
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.venue.toLowerCase().includes(query.toLowerCase()) ||
        e.city.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || e.category === category;
      const matchesCity = city === "All cities" || e.city === city;
      return matchesQuery && matchesCategory && matchesCity;
    });
  }, [query, category, city]);

  // Sort events: active events first, then by cheapest price
  const sortedEvents = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aHasTickets = !!getCheapestActiveTier(a.ticketLevels);
      const bHasTickets = !!getCheapestActiveTier(b.ticketLevels);
      
      if (aHasTickets && !bHasTickets) return -1;
      if (!aHasTickets && bHasTickets) return 1;
      
      const aPrice = getCheapestActiveTier(a.ticketLevels)?.tier.price || Infinity;
      const bPrice = getCheapestActiveTier(b.ticketLevels)?.tier.price || Infinity;
      return aPrice - bPrice;
    });
  }, [filtered]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setCity("All cities");
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: "'Manrope', sans-serif",
      overflowX: 'hidden', // FIXED: Prevent horizontal scroll
      maxWidth: '100%', // FIXED: Ensure full width containment
    }}>
      {/* Page header */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)',
          padding: '40px 16px', // FIXED: Reduced padding on mobile
        }}
        className="hero-section"
      >
        {/* Decorative elements - FIXED: Hide on mobile for better performance */}
        <div
          style={{
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
          className="decorative-blob"
        />
        <div
          style={{
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
          className="decorative-blob"
        />
        
        <div
          style={{
            position: 'relative',
            maxWidth: '1280px',
            margin: '0 auto',
            color: '#ffffff',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span
              style={{
                height: '6px',
                width: '6px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
              }}
            />
            Live Events
          </span>
          <h1
            style={{
              marginTop: '16px',
              maxWidth: '768px',
              fontSize: '24px', // FIXED: Smaller on mobile
              fontWeight: 800,
              letterSpacing: '-0.025em',
            }}
            className="page-title"
          >
            Every experience worth showing up for.
          </h1>
          <p
            style={{
              marginTop: '8px', // FIXED: Reduced margin
              maxWidth: '672px',
              fontSize: '14px', // FIXED: Smaller on mobile
              opacity: 0.8,
            }}
            className="page-subtitle"
          >
            Browse our current lineup of events and grab your spot in seconds.
          </p>
          
          {/* Search + filters - FIXED: Better mobile layout */}
          <div
            style={{
              marginTop: '24px', // FIXED: Reduced margin
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '12px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
              width: '100%', // FIXED: Full width
              maxWidth: '100%', // FIXED: Prevent overflow
              boxSizing: 'border-box', // FIXED: Include padding in width
            }}
            className="filter-container"
          >
            <div style={{ 
              position: 'relative', 
              flex: 1,
              width: '100%', // FIXED: Full width
              maxWidth: '100%', // FIXED: Prevent overflow
            }}>
              <Search
                style={{
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  height: '20px',
                  width: '20px',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues, or locations..."
                style={{
                  height: '48px', // FIXED: Larger for touch (44px+)
                  width: '100%',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  padding: '0 12px 0 40px',
                  fontSize: '16px', // FIXED: Prevents iOS zoom
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column', // FIXED: Stack on mobile
                gap: '8px',
                width: '100%', // FIXED: Full width
                maxWidth: '100%', // FIXED: Prevent overflow
              }}
              className="filter-selects"
            >
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  height: '48px', // FIXED: Larger for touch
                  width: '100%', // FIXED: Full width
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  padding: '0 12px',
                  fontSize: '16px', // FIXED: Prevents iOS zoom
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  flex: '1',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  height: '48px', // FIXED: Larger for touch
                  width: '100%', // FIXED: Full width
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  padding: '0 12px',
                  fontSize: '16px', // FIXED: Prevents iOS zoom
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  flex: '1',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section
        style={{
          padding: '24px 12px', // FIXED: Reduced padding on mobile
          fontFamily: "'Manrope', sans-serif",
          maxWidth: '100%', // FIXED: Prevent overflow
          overflowX: 'hidden', // FIXED: Prevent horizontal scroll
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 4px', // FIXED: Small padding
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap', // FIXED: Wrap on small screens
              gap: '8px', // FIXED: Gap for wrapped items
            }}
          >
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: '0', // FIXED: Remove default margin
            }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{sortedEvents.length}</span>
              {" "}event{sortedEvents.length === 1 ? "" : "s"} found
            </p>
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#6b7280',
              }}
              className="sort-desktop"
            >
              <SlidersHorizontal style={{ height: '16px', width: '16px' }} />
              Sorted by availability & price
            </div>
          </div>

          {sortedEvents.length === 0 ? (
            <div
              style={{
                marginTop: '32px', // FIXED: Reduced margin
                borderRadius: '24px',
                border: '2px dashed #e5e7eb',
                backgroundColor: '#ffffff',
                padding: '32px 16px', // FIXED: Better mobile padding
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                No events match your filters
              </p>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                Try clearing a filter or searching a different keyword.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  marginTop: '24px',
                  borderRadius: '9999px',
                  backgroundColor: '#7c3aed',
                  padding: '12px 24px', // FIXED: Larger touch target
                  fontSize: '16px', // FIXED: Prevents iOS zoom
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.3s ease',
                  minHeight: '48px', // FIXED: Touch-friendly
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6d28d9';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: '24px', // FIXED: Reduced margin
                display: 'grid',
                gap: '16px', // FIXED: Reduced gap on mobile
                gridTemplateColumns: '1fr', // Mobile default
                width: '100%', // FIXED: Full width
                maxWidth: '100%', // FIXED: Prevent overflow
              }}
              className="events-grid"
            >
              {sortedEvents.map((event) => (
                <div key={event.id} style={{ width: '100%' }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FIXED: Comprehensive responsive styles */}
      <style>
        {`
          /* FIXED: Show decorative blobs on tablet/desktop only */
          @media (min-width: 768px) {
            .decorative-blob {
              display: block !important;
            }
            
            .hero-section {
              padding: 64px 16px !important;
            }
            
            .page-title {
              font-size: 30px !important;
            }
            
            .page-subtitle {
              font-size: 16px !important;
              margin-top: 12px !important;
            }
          }
          
          /* FIXED: Filter container improvements */
          @media (min-width: 640px) {
            .filter-container {
              flex-direction: row !important;
              align-items: center !important;
              padding: 16px !important;
            }
            
            .filter-selects {
              flex-direction: row !important;
              gap: 12px !important;
              width: auto !important;
            }
            
            .filter-selects select {
              width: auto !important;
              min-width: 140px !important;
            }
          }
          
          /* FIXED: Grid responsive breakpoints */
          @media (min-width: 640px) {
            .events-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
            
            section {
              padding: 32px 16px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .events-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 24px !important;
            }
            
            .sort-desktop {
              display: flex !important;
            }
            
            section {
              padding: 48px 16px !important;
            }
          }
          
          /* FIXED: Prevent any overflow */
          * {
            box-sizing: border-box;
          }
          
          /* FIXED: Ensure selects work properly on iOS */
          select {
            -webkit-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            padding-right: 36px !important;
          }
          
          /* FIXED: Better touch targets */
          input, select, button {
            touch-action: manipulation;
          }
          
          /* FIXED: Smooth animations */
          .events-grid > div {
            animation: fadeInUp 0.4s ease forwards;
            opacity: 0;
          }
          
          .events-grid > div:nth-child(1) { animation-delay: 0.05s; }
          .events-grid > div:nth-child(2) { animation-delay: 0.1s; }
          .events-grid > div:nth-child(3) { animation-delay: 0.15s; }
          .events-grid > div:nth-child(4) { animation-delay: 0.2s; }
          .events-grid > div:nth-child(5) { animation-delay: 0.25s; }
          .events-grid > div:nth-child(6) { animation-delay: 0.3s; }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Events;