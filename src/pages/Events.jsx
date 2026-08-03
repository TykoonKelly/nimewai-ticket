// src/pages/Events.jsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Ticket, SlidersHorizontal } from 'lucide-react';
import EventImage from '../component/EventImage'; // Fixed path to component folder
import { getEventImage } from '../utils/eventImages.jsx'; // Fixed path with .jsx extension
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
      
      // Show events with tickets first
      if (aHasTickets && !bHasTickets) return -1;
      if (!aHasTickets && bHasTickets) return 1;
      
      // Then sort by cheapest price
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
    }}>
      {/* Page header */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)',
          padding: '64px 16px',
        }}
      >
        {/* Decorative elements */}
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
          }}
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
          }}
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
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
            }}
          >
            Every experience worth showing up for.
          </h1>
          <p
            style={{
              marginTop: '12px',
              maxWidth: '672px',
              fontSize: '16px',
              opacity: 0.8,
            }}
          >
            Browse our current lineup of events and grab your spot in seconds.
          </p>
          
          {/* Search + filters */}
          <div
            style={{
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '12px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
            }}
            className="filter-container"
          >
            <div style={{ position: 'relative', flex: 1 }}>
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
                  height: '44px',
                  width: '100%',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  padding: '0 12px 0 40px',
                  fontSize: '14px',
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
                flexDirection: 'column',
                gap: '8px',
              }}
              className="filter-selects"
            >
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  flex: 1,
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
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  flex: 1,
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
          padding: '48px 16px',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
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
                marginTop: '48px',
                borderRadius: '24px',
                border: '2px dashed #e5e7eb',
                backgroundColor: '#ffffff',
                padding: '48px',
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
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.3s ease',
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
                marginTop: '32px',
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: '1fr',
              }}
              className="events-grid"
            >
              {sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add responsive styles */}
      <style>
        {`
          @media (min-width: 640px) {
            .filter-container {
              flex-direction: row !important;
              align-items: center !important;
            }
            .filter-selects {
              flex-direction: row !important;
            }
            .events-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (min-width: 1024px) {
            .events-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
            .sort-desktop {
              display: flex !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Events;