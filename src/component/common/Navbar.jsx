// src/components/common/Navbar.jsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with your auth state
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  useEffect(() => {
    // Add shimmer animation styles
    if (!document.getElementById('navbar-styles')) {
      const style = document.createElement('style');
      style.id = 'navbar-styles';
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Mobile menu overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        /* Mobile menu panel */
        .mobile-menu-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 80%;
          max-width: 320px;
          height: 100vh;
          background: white;
          z-index: 1000;
          padding: 24px 20px;
          box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
          animation: slideDown 0.3s ease;
          overflow-y: auto;
        }

        .mobile-menu-panel .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #4b5563;
          padding: 4px 8px;
          float: right;
        }

        .mobile-menu-panel .mobile-link {
          display: block;
          padding: 16px 0;
          color: #1f2937;
          text-decoration: none;
          font-size: 18px;
          font-weight: 500;
          border-bottom: 1px solid #f3f4f6;
          transition: color 0.2s;
        }

        .mobile-menu-panel .mobile-link:hover {
          color: #7c3aed;
        }

        .mobile-menu-panel .mobile-login-btn {
          display: block;
          width: 100%;
          padding: 14px;
          margin-top: 16px;
          text-align: center;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .mobile-menu-panel .mobile-login-btn:hover {
          transform: scale(1.02);
        }

        .mobile-menu-panel .mobile-cart-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          margin-top: 8px;
          border-bottom: 1px solid #f3f4f6;
          text-decoration: none;
          color: #1f2937;
          font-size: 18px;
          font-weight: 500;
        }

        /* Hamburger icon animation */
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 4px;
          background: none;
          border: none;
        }

        .hamburger span {
          display: block;
          width: 28px;
          height: 3px;
          background: #4b5563;
          border-radius: 3px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 6px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -6px);
        }

        /* Desktop styles */
        @media (max-width: 768px) {
          .desktop-nav-links {
            display: none !important;
          }
          .desktop-right-section {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-hamburger {
            display: none !important;
          }
          .desktop-nav-links {
            display: flex !important;
          }
          .desktop-right-section {
            display: flex !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Prevent scrolling when mobile menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Logo Section - LEFT */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          gap: '10px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(8deg) scale(1.08)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(124, 58, 237, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.35)';
          }}>
            🎫
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.1
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              fontWeight: 700,
              color: '#b8860b',
              letterSpacing: '-0.5px',
              textShadow: '0 1px 2px rgba(184, 134, 11, 0.15)',
            }}>
              Nimewai
            </span>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              fontWeight: 700,
              fontStyle: 'italic',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
              display: 'inline-block'
            }}>
              Ticket
            </span>
          </div>
        </Link>

        {/* Navigation Links - CENTER (Desktop) */}
        <div className="desktop-nav-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <Link to="/" style={{
            color: '#4b5563',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.color = '#4b5563'}
          >
            Home
          </Link>
          
          <Link to="/events" style={{
            color: '#4b5563',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.color = '#4b5563'}
          >
            Events
          </Link>
          
          <Link to="/about" style={{
            color: '#4b5563',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.color = '#4b5563'}
          >
            About
          </Link>
        </div>

        {/* Right Side - Login + Cart (Desktop) */}
        <div className="desktop-right-section" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* LOGIN BUTTON */}
          {isLoggedIn ? (
            <Link to="/profile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '50px',
              textDecoration: 'none',
              color: '#1f2937',
              fontWeight: 500,
              fontSize: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <span style={{ fontSize: '18px' }}>👤</span>
              Profile
            </Link>
          ) : (
            <Link to="/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '50px',
              textDecoration: 'none',
              color: '#7c3aed',
              fontWeight: 600,
              fontSize: '14px',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
              e.currentTarget.style.color = '#7c3aed';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <span style={{ fontSize: '16px' }}>🔑</span>
              Login
            </Link>
          )}

          {/* CART BUTTON with dynamic count */}
          <Link to="/cart" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '8px 16px 8px 12px',
            borderRadius: '50px',
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(124, 58, 237, 0.1)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <span style={{ fontSize: '18px' }}>🛒</span>
            <span className="cart-text">Cart</span>
            <span style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 700,
              marginLeft: '4px',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {cartCount}
            </span>
          </Link>
        </div>

        {/* Hamburger Menu - Mobile */}
        <button 
          className={`hamburger mobile-hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu} />
      )}

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="mobile-menu-panel">
          <button className="close-btn" onClick={closeMenu}>✕</button>
          
          <div style={{ marginTop: '1800px' }}>
            <Link to="/" className="mobile-link" onClick={closeMenu}>
              🏠 Home
            </Link>
            <Link to="/events" className="mobile-link" onClick={closeMenu}>
              📅 Events
            </Link>
            <Link to="/about" className="mobile-link" onClick={closeMenu}>
              ℹ️ About
            </Link>
            
            {/* Mobile Cart with dynamic count */}
            <Link to="/cart" className="mobile-cart-btn" onClick={closeMenu}>
              <span>🛒 Cart</span>
              <span style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 10px',
                fontSize: '14px',
                fontWeight: 700,
                minWidth: '24px',
                textAlign: 'center'
              }}>
                {cartCount}
              </span>
            </Link>

            {/* Mobile Login/Profile */}
            {isLoggedIn ? (
              <Link to="/profile" className="mobile-login-btn" onClick={closeMenu} style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white',
                display: 'block',
                width: '100%',
                padding: '14px',
                marginTop: '16px',
                textAlign: 'center',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                👤 My Profile
              </Link>
            ) : (
              <Link to="/login" className="mobile-login-btn" onClick={closeMenu}>
                🔑 Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;