// src/pages/organizer/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getOrganizerEvents } from '../../services/firebaseService';
import LiveSales from '../../pages/organizer/LiveSales';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getOrganizerEvents(user.uid);
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: 700,
            color: '#1f2937'
          }}>
            Welcome, {user?.name || 'Organizer'}! 👋
          </h1>
          <p style={{ color: '#6b7280' }}>
            Track your events and ticket sales in real-time
          </p>
        </div>
        <button
          style={{
            padding: '12px 24px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6d28d9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7c3aed';
          }}
        >
          + Create New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎪</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '8px',
            fontFamily: "'Playfair Display', serif"
          }}>
            No Events Yet
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Create your first event and start selling tickets!
          </p>
          <button
            style={{
              padding: '12px 32px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Create Event
          </button>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                style={{
                  padding: '12px 24px',
                  background: selectedEvent?.id === event.id ? '#7c3aed' : 'white',
                  color: selectedEvent?.id === event.id ? 'white' : '#374151',
                  border: selectedEvent?.id === event.id ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s'
                }}
              >
                {event.title}
                <span style={{
                  marginLeft: '8px',
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  ({event.ticketsSold || 0} sold)
                </span>
              </button>
            ))}
          </div>

          {selectedEvent && <LiveSales eventId={selectedEvent.id} />}
        </>
      )}
    </div>
  );
};

export default OrganizerDashboard;