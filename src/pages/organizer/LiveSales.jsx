// src/components/organizer/LiveSales.jsx
import { useState, useEffect } from 'react';
import { listenToOrganizerSales } from '../../services/firebaseService';
import { useAuth } from '../../hooks/useAuth';
import { FaTicketAlt, FaDollarSign, FaUsers } from 'react-icons/fa';

const LiveSales = ({ eventId }) => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSold: 0,
    totalRevenue: 0,
    uniqueBuyers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToOrganizerSales(user.uid, (salesData) => {
      const eventSales = salesData.filter(sale => sale.eventId === eventId);
      setSales(eventSales);
      
      const totalSold = eventSales.length;
      const totalRevenue = eventSales.reduce((sum, sale) => sum + (sale.price || 0), 0);
      const uniqueBuyers = new Set(eventSales.map(sale => sale.userId)).size;
      
      setStats({ totalSold, totalRevenue, uniqueBuyers });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId, user.uid]);

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎟️ Live Ticket Sales
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              fontFamily: "'Inter', sans-serif"
            }}>
              Live Updates
            </span>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          fontFamily: "'Inter', sans-serif"
        }}>
          Last update: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FaTicketAlt color="#7c3aed" />
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Tickets Sold
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#1f2937'
          }}>
            {stats.totalSold}
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FaDollarSign color="#10b981" />
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Revenue
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#1f2937'
          }}>
            ${stats.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FaUsers color="#3b82f6" />
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Unique Buyers
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#1f2937'
          }}>
            {stats.uniqueBuyers}
          </div>
        </div>
      </div>

      <div>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#6b7280',
          marginBottom: '12px',
          fontFamily: "'Inter', sans-serif"
        }}>
          Recent Purchases
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {sales.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              fontFamily: "'Inter', sans-serif"
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎫</div>
              <p>No tickets sold yet. Share your event to get started!</p>
            </div>
          ) : (
            sales.slice(0, 10).map((sale, index) => (
              <div
                key={sale.id || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#7c3aed',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {sale.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1f2937',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {sale.userName || 'Anonymous User'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Ticket #{sale.id?.slice(0, 8) || 'N/A'}
                    </div>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#10b981'
                  }}>
                    ${sale.price?.toFixed(2) || '0.00'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {sale.purchaseDate?.toDate?.()?.toLocaleTimeString() || 'N/A'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LiveSales;