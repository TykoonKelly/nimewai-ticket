// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signIn } from '../config/firebase';
import logo from '/NTlogo1.png'; // ✅ IMPORT YOUR LOGO

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setFirebaseError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFirebaseError('');

    // Sign in with Firebase
    const { user, error } = await signIn(formData.email, formData.password);

    setLoading(false);

    if (error) {
      // Handle Firebase errors with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      if (error.includes('user-not-found')) {
        errorMessage = 'No account found with this email.';
      } else if (error.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.includes('invalid-email')) {
        errorMessage = 'Invalid email address.';
      }
      setFirebaseError(errorMessage);
      return;
    }

    if (user) {
      // Store user in localStorage for persistence
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'User');
      localStorage.setItem('userUid', user.uid);
      navigate('/');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Minimal Google Icon
  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );

  // Minimal Apple Icon
  const AppleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }} aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.22-1.14 3.03-.78.88-2.04 1.55-3.09 1.47-.13-1.12.42-2.28 1.11-3.03.78-.85 2.13-1.47 3.12-1.47zm4.02 17.03c-.55 1.27-.82 1.83-1.53 2.95-.99 1.56-2.39 3.5-4.12 3.52-1.54.01-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07 1-1.73-.02-3.06-1.77-4.05-3.33C.03 17.9-.24 12.34 2.86 9.5c1.11-1.02 2.55-1.66 4.08-1.68 1.57-.02 3.05 1.05 4.03 1.05.98 0 2.78-1.3 4.68-1.11.79.03 3.02.32 4.45 2.4-.12.07-2.66 1.55-2.63 4.62.03 3.67 3.19 4.89 3.22 4.9z" />
    </svg>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe, #faf5ff)',
        fontFamily: "'Manrope', sans-serif",
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card - Centered */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          boxShadow: '0 25px 60px rgba(124, 58, 237, 0.12)',
          padding: '48px 40px',
          border: '1px solid rgba(124, 58, 237, 0.06)',
        }}
      >
        {/* Logo - UPDATED WITH YOUR IMAGE */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            textDecoration: 'none',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
              backgroundColor: '#2e1065', // Dark purple background
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.25)';
            }}
          >
            <img
              src={logo}
              alt="Nimewai Ticket Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '4px',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#b8860b',
                letterSpacing: '-0.5px',
              }}
            >
              Nimewai
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 700,
                fontStyle: 'italic',
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ticket
            </span>
          </div>
        </Link>

        <h2
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
            letterSpacing: '-0.5px',
          }}
        >
          Welcome back
        </h2>
        <p
          style={{
            marginTop: '6px',
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          Log in to your account
        </p>

        {/* Firebase Error Message */}
        {firebaseError && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {firebaseError}
          </div>
        )}

        {/* Social Auth Buttons - Minimal */}
        <div
          style={{
            marginTop: '28px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: "'Manrope', sans-serif",
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.backgroundColor = '#f5f3ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: "'Manrope', sans-serif",
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.backgroundColor = '#f5f3ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <AppleIcon />
            Apple
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e5e7eb',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9ca3af',
            }}
          >
            or
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e5e7eb',
            }}
          />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '4px',
              }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '16px',
                  width: '16px',
                  color: '#9ca3af',
                }}
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px 0 38px',
                  borderRadius: '10px',
                  border: errors.email ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : '#7c3aed';
                  e.target.style.boxShadow = errors.email
                    ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                    : '0 0 0 3px rgba(124, 58, 237, 0.08)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
              />
            </div>
            {errors.email && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                Password
              </label>
              <button
                type="button"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#7c3aed',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#6d28d9')}
                onMouseLeave={(e) => (e.target.style.color = '#7c3aed')}
              >
                Forgot?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '16px',
                  width: '16px',
                  color: '#9ca3af',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 40px 0 38px',
                  borderRadius: '10px',
                  border: errors.password ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#7c3aed';
                  e.target.style.boxShadow = errors.password
                    ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                    : '0 0 0 3px rgba(124, 58, 237, 0.08)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ height: '16px', width: '16px' }} />
                ) : (
                  <Eye style={{ height: '16px', width: '16px' }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#6b7280',
              cursor: 'pointer',
              marginTop: '2px',
            }}
          >
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#7c3aed',
                cursor: 'pointer',
              }}
            />
            Remember me
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '10px',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: "'Manrope', sans-serif",
              color: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
              }
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight style={{ height: '16px', width: '16px' }} />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#6d28d9')}
            onMouseLeave={(e) => (e.target.style.color = '#7c3aed')}
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;