// src/components/HowItWorks.jsx
import { Link } from 'react-router-dom';
import { Search, CreditCard, QrCode, PartyPopper, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Discover",
      description: "Browse thousands of curated events — from intimate gigs to large-scale conferences — filtered to match your vibe.",
    },
    {
      number: "02",
      icon: CreditCard,
      title: "Book securely",
      description: "Pay with M-Pesa, card, or bank transfer. Every checkout is encrypted and confirmed in seconds.",
    },
    {
      number: "03",
      icon: QrCode,
      title: "Get your QR ticket",
      description: "Tickets land in your inbox and Nimewahi wallet instantly. Show the QR code at the gate — no printing needed.",
    },
    {
      number: "04",
      icon: PartyPopper,
      title: "Show up & enjoy",
      description: "Skip the queues, walk right in, and make memories. Rate the event afterwards to help the community.",
    },
  ];

  return (
    <section
      style={{
        fontFamily: "'Manrope', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        padding: '80px 16px',
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: '50%',
          height: '384px',
          width: '384px',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.1)',
          filter: 'blur(80px)',
        }}
      />
      
      <div
        style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            maxWidth: '672px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '9999px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#7c3aed',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <span
              style={{
                height: '6px',
                width: '6px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                animation: 'pulse 2s infinite',
              }}
            />
            How it works
          </span>
          <h2
            style={{
              marginTop: '16px',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#111827',
            }}
          >
            From discovery to doors open in four easy steps
          </h2>
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              marginTop: '12px',
              fontSize: '16px',
              color: '#4b5563',
            }}
          >
            We built Nimewahi Ticket to be so smooth, you'll wonder why ticketing was ever this hard.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          style={{
            position: 'relative',
            marginTop: '64px',
          }}
        >
          {/* Connecting line for desktop */}
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              left: 0,
              right: 0,
              top: '40px',
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(124, 58, 237, 0.4), transparent)',
              display: 'none',
            }}
            className="desktop-line"
          />
          
          <div
            style={{
              display: 'grid',
              gap: '32px',
              gridTemplateColumns: '1fr',
            }}
            className="steps-grid"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '16px',
                    position: 'relative',
                  }}
                  className="step-item"
                >
                  {/* Icon bubble */}
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '16px',
                        background: 'rgba(124, 58, 237, 0.2)',
                        filter: 'blur(24px)',
                        transition: 'all 0.5s ease',
                      }}
                      className="icon-glow"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                      }}
                    />
                    <div
                      style={{
                        position: 'relative',
                        display: 'flex',
                        height: '80px',
                        width: '80px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Icon
                        style={{
                          height: '32px',
                          width: '32px',
                          color: '#7c3aed',
                          strokeWidth: 2,
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: '-8px',
                          top: '-8px',
                          display: 'flex',
                          height: '32px',
                          width: '32px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#111827',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#111827',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        lineHeight: 1.625,
                        color: '#4b5563',
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow separator (desktop) */}
                  {index < steps.length - 1 && (
                    <ArrowRight
                      style={{
                        pointerEvents: 'none',
                        position: 'absolute',
                        right: '-16px',
                        top: '24px',
                        height: '24px',
                        width: '24px',
                        color: 'rgba(124, 58, 237, 0.4)',
                        display: 'none',
                      }}
                      className="desktop-arrow"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div
          style={{
            position: 'relative',
            marginTop: '64px',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)',
            padding: '32px',
            boxShadow: '0 16px 48px rgba(124, 58, 237, 0.2)',
          }}
        >
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              right: '-64px',
              top: '-64px',
              height: '256px',
              width: '256px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.3)',
              filter: 'blur(64px)',
            }}
          />
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              bottom: '-80px',
              left: '-40px',
              height: '256px',
              width: '256px',
              borderRadius: '50%',
              background: 'rgba(251, 191, 36, 0.2)',
              filter: 'blur(64px)',
            }}
          />
          
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div style={{ maxWidth: '672px' }}>
              <h3
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Hosting an event? Sell tickets in minutes.
              </h3>
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  marginTop: '8px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                Join 500+ organizers using Nimewahi to run smooth, sold-out events — corporate or entertainment.
              </p>
            </div>
            <Link
              to="/organizers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                backgroundColor: '#f59e0b',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111827',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fbbf24';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.5)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Become an organizer
              <ArrowRight style={{ height: '16px', width: '16px' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Add keyframe animations and responsive styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @media (min-width: 768px) {
            .steps-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (min-width: 1024px) {
            .steps-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
            .desktop-line {
              display: block !important;
            }
            .desktop-arrow {
              display: block !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HowItWorks;