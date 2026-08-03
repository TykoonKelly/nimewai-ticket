// src/components/admin/AdminLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaTicketAlt,
  FaHandshake,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('isAdmin');
      // Clear any other admin-related localStorage items
      localStorage.removeItem('adminUser');
      // Navigate to admin login
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/events', icon: FaCalendarAlt, label: 'Events' },
    { path: '/admin/requests', icon: FaHandshake, label: 'Organizer Requests' },
    { path: '/admin/tickets', icon: FaTicketAlt, label: 'Tickets' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/analytics', icon: FaChartLine, label: 'Analytics' },
  ];

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        height: '100vh',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        zIndex: 1000,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          <Link to="/admin" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🎫
            </div>
            <div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#1f2937'
              }}>
                Nimewai
              </span>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: 400,
                color: '#7c3aed',
                fontStyle: 'italic'
              }}>
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto'
        }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: isActive ? '#7c3aed' : '#6b7280',
                  background: isActive ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
          background: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 600,
              flexShrink: 0
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div style={{
              minWidth: 0,
              flex: 1
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1f2937',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Admin'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {user?.role === 'admin' ? 'Administrator' : user?.role || 'Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <FaSignOutAlt size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '260px',
        flex: 1,
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '0'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;