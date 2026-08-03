// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../pages/admin/StatCard';
import EventTable from '../../pages/admin/EventTable';
import RequestList from '../../pages/admin/RequestList';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaTicketAlt, 
  FaDollarSign,
  FaHandshake
} from 'react-icons/fa';
import { db } from '../../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from Firestore
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    pendingRequests: 0
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  // Fetch all dashboard data from Firebase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Fetch all events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;

      // Fetch recent events (last 5)
      const recentEventsQuery = query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentEventsSnapshot = await getDocs(recentEventsQuery);
      const recentEventsData = recentEventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all tickets to calculate revenue and count
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      let totalTicketsSold = 0;
      let totalRevenue = 0;

      ticketsSnapshot.forEach(doc => {
        const ticketData = doc.data();
        if (ticketData.paymentStatus === 'paid' || ticketData.paymentStatus === 'confirmed') {
          totalTicketsSold += ticketData.quantity || 1;
          totalRevenue += ticketData.totalPrice || 0;
        }
      });

      // Fetch pending organizer requests
      const requestsQuery = query(
        collection(db, 'organizerRequests'),
        where('status', '==', 'pending')
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const pendingRequestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch recent tickets for activity feed
      const recentTicketsQuery = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentTicketsSnapshot = await getDocs(recentTicketsQuery);
      const recentTicketsData = recentTicketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update state with real data
      setStats({
        totalUsers,
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        pendingRequests: pendingRequestsData.length
      });

      setRecentEvents(recentEventsData);
      setPendingRequests(pendingRequestsData);
      setRecentTickets(recentTicketsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listeners for live updates
  useEffect(() => {
    // Check authentication
    if (!authLoading) {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const userIsAdmin = user?.role === 'admin';
      
      if (!isAdmin || !userIsAdmin) {
        navigate('/admin/login');
        return;
      }
      
      // Initial data fetch
      fetchDashboardData();

      // Set up real-time listeners for live updates
      const unsubscribeEvents = onSnapshot(collection(db, 'events'), () => {
        fetchDashboardData();
      });

      const unsubscribeTickets = onSnapshot(collection(db, 'tickets'), () => {
        fetchDashboardData();
      });

      const unsubscribeRequests = onSnapshot(
        query(collection(db, 'organizerRequests'), where('status', '==', 'pending')),
        () => {
          fetchDashboardData();
        }
      );

      // Cleanup listeners on unmount
      return () => {
        unsubscribeEvents();
        unsubscribeTickets();
        unsubscribeRequests();
      };
    }
  }, [authLoading, user, navigate]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  // Show loading spinner
  if (loading || authLoading) {
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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Format KSH currency
  const formatKSH = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Dashboard</h2>
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button
          onClick={handleRefresh}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
            Welcome back, {user?.name || 'Administrator'}! Here's what's happening with your platform.
          </p>
          <p style={{ 
            color: '#6b7280', 
            fontFamily: "'Inter', sans-serif", 
            fontSize: '13px',
            marginTop: '4px'
          }}>
            📊 Live data from your platform
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#9ca3af' : '#7c3aed',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#6d28d9';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#7c3aed';
            }
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<FaUsers />}
          color="#3b82f6"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<FaCalendarAlt />}
          color="#7c3aed"
        />
        <StatCard
          title="Tickets Sold"
          value={stats.totalTicketsSold.toLocaleString()}
          icon={<FaTicketAlt />}
          color="#10b981"
        />
        <StatCard
          title="Revenue"
          value={formatKSH(stats.totalRevenue)}
          icon={<FaDollarSign />}
          color="#f59e0b"
        />
      </div>

      {/* Pending Requests Alert */}
      {stats.pendingRequests > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaHandshake size={24} color="#f59e0b" />
            <div>
              <span style={{
                fontWeight: 600,
                color: '#92400e',
                fontFamily: "'Inter', sans-serif"
              }}>
                {stats.pendingRequests} organizer request{stats.pendingRequests > 1 ? 's' : ''} pending approval
              </span>
              <span style={{
                marginLeft: '12px',
                color: '#78350f',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Review them now to help organizers get started!
              </span>
            </div>
          </div>
          <Link
            to="/admin/requests"
            style={{
              padding: '8px 16px',
              background: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f59e0b';
            }}
          >
            View Requests →
          </Link>
        </div>
      )}

      {/* Recent Events & Pending Requests */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
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
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1f2937',
              margin: 0,
              fontFamily: "'Inter', sans-serif"
            }}>
              Recent Events
            </h3>
            <Link
              to="/admin/events"
              style={{
                fontSize: '14px',
                color: '#7c3aed',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              View All →
            </Link>
          </div>
          <EventTable events={recentEvents} />
        </div>

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
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1f2937',
              margin: 0,
              fontFamily: "'Inter', sans-serif"
            }}>
              Pending Requests
            </h3>
            <Link
              to="/admin/requests"
              style={{
                fontSize: '14px',
                color: '#7c3aed',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              View All →
            </Link>
          </div>
          <RequestList requests={pendingRequests} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;