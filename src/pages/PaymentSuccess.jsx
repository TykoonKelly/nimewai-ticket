// src/pages/PaymentSuccess.jsx
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Ticket, Mail } from 'lucide-react';

export default function PaymentSuccess() {
  const location = useLocation();
  const { items, paymentData } = location.state || { items: [], paymentData: {} };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: '#d1fae5',
        }}>
          <CheckCircle size={48} color="#059669" />
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#111827',
          marginBottom: '8px',
        }}>
          Payment Successful! 🎉
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '24px',
        }}>
          Your tickets have been confirmed. Check your email for the QR code.
        </p>

        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#6b7280',
            fontSize: '14px',
          }}>
            <Mail size={16} />
            <span>Check your email for ticket details</span>
          </div>
        </div>

        <div style={{
          textAlign: 'left',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            Order Summary
          </h3>
          {items.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6',
              fontSize: '14px',
            }}>
              <span style={{ color: '#374151' }}>
                {item.tierName} × {item.quantity}
              </span>
              <span style={{ fontWeight: 600, color: '#111827' }}>
                KES {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <Link
          to="/events"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            borderRadius: '9999px',
            background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Browse More Events
        </Link>
      </div>
    </div>
  );
}