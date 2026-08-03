// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth(); // Make sure logout is imported
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if user has admin role
        if (result.user?.role === 'admin') {
          // Set admin session
          localStorage.setItem('isAdmin', 'true');
          document.cookie = 'admin_session=true; max-age=604800; path=/';
          navigate('/admin');
        } else {
          setError('Access denied. This portal is for administrators only.');
          // Log out non-admin users
          await logout();
        }
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Security Badge */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Inter', sans-serif"
      }}>
        🔒 Secure Admin Portal
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            fontSize: '32px',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)'
          }}>
            🛡️
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '4px'
          }}>
            Admin Portal
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif"
          }}>
            Secure access for platform administrators
          </p>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '6px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@nimewaiticket.com"
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
              placeholder="••••••••"
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
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

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
        </div>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#6b7280',
          textAlign: 'center',
          border: '1px dashed #e5e7eb',
          fontFamily: "'Inter', sans-serif"
        }}>
          🔑 Admin access is restricted to authorized personnel only
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;