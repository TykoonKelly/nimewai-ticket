// src/pages/organizer/OrganizerLogin.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const OrganizerLogin = () => {
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventFound, setEventFound] = useState(null);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const checkEvent = async () => {
    setError('');
    setLoading(true);
    
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef, 
        where('title', '>=', eventName),
        where('title', '<=', eventName + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError('Event not found. Please check the event name.');
        setLoading(false);
        return;
      }

      const organizerIds = new Set();
      const events = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.organizerId) {
          organizerIds.add(data.organizerId);
          events.push({ id: doc.id, ...data });
        }
      });

      if (organizerIds.size === 0) {
        setError('No organizer found for this event.');
        setLoading(false);
        return;
      }

      if (organizerIds.size > 1) {
        const organizerData = [];
        for (const orgId of organizerIds) {
          const userRef = collection(db, 'users');
          const userQ = query(userRef, where('uid', '==', orgId));
          const userSnap = await getDocs(userQ);
          userSnap.forEach(doc => {
            organizerData.push({
              organizerId: orgId,
              name: doc.data().name,
              email: doc.data().email,
              events: events.filter(e => e.organizerId === orgId)
            });
          });
        }
        setOrganizerEvents(organizerData);
        setLoading(false);
        return;
      }

      const organizerId = Array.from(organizerIds)[0];
      const userRef = collection(db, 'users');
      const userQ = query(userRef, where('uid', '==', organizerId));
      const userSnap = await getDocs(userQ);
      
      let organizerEmail = '';
      userSnap.forEach(doc => {
        organizerEmail = doc.data().email;
        setEventFound({
          organizerId,
          email: organizerEmail,
          events: events.filter(e => e.organizerId === organizerId)
        });
      });

      if (organizerEmail) {
        setEmail(organizerEmail);
        setStep(2);
      } else {
        setError('Organizer not found.');
      }
    } catch (error) {
      console.error('Error checking event:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        if (result.user?.role === 'organizer') {
          navigate('/organizer');
        } else {
          setError('This account is not registered as an organizer.');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Multiple organizers found
  if (organizerEvents.length > 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(124, 58, 237, 0.15)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎪</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              color: '#1f2937'
            }}>
              Select Your Event
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
              Multiple events found. Choose the one you organize:
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {organizerEvents.map((org, index) => (
              <button
                key={index}
                onClick={() => {
                  setEventFound(org);
                  setEmail(org.email);
                  setOrganizerEvents([]);
                  setStep(2);
                }}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.background = '#f9f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{
                  fontWeight: 600,
                  color: '#1f2937'
                }}>
                  {org.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>
                  {org.events.length} event{org.events.length > 1 ? 's' : ''}: {org.events.map(e => e.title).join(', ')}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setOrganizerEvents([]);
              setStep(1);
            }}
            style={{
              marginTop: '16px',
              padding: '10px',
              background: 'transparent',
              border: 'none',
              color: '#7c3aed',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
              textDecoration: 'underline',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            ← Try a different event name
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(124, 58, 237, 0.15)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {step === 1 ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎪</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#1f2937'
              }}>
                Organizer Login
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Enter your event name to continue
              </p>
            </>
          ) : (
            <>
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                color: 'white'
              }}>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8,
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  🎫 Event
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {eventFound?.events?.[0]?.title || eventName}
                </div>
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Enter your credentials to access your dashboard
              </p>
            </>
          )}
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif"
          }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); checkEvent(); }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                placeholder="e.g., Music Festival 2026"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <p style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#6b7280',
                fontFamily: "'Inter', sans-serif"
              }}>
                Enter the exact name of your event as it appears on the platform
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Searching...' : 'Find My Event →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              style={{
                marginTop: '12px',
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#7c3aed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ← Try a different event
            </button>
          </form>
        )}

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#6b7280',
          fontFamily: "'Inter', sans-serif"
        }}>
          <Link to="/" style={{
            color: '#7c3aed',
            textDecoration: 'none'
          }}>
            ← Back to Home
          </Link>
          <span style={{ margin: '0 8px' }}>•</span>
          <Link to="/login/admin" style={{
            color: '#7c3aed',
            textDecoration: 'none'
          }}>
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLogin;