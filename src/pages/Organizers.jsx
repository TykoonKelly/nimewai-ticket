// src/pages/Organizers.jsx
import { useState } from "react";
import {
  Ticket,
  Users,
  ShieldCheck,
  BarChart3,
  Headphones,
  ArrowRight,
  CheckCircle,
  Send,
  User,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Organizers = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validate(values) {
    const next = {};
    if (!values.fullName.trim()) {
      next.fullName = "Please enter your full name.";
    } else if (values.fullName.trim().length > 100) {
      next.fullName = "Name must be under 100 characters.";
    }
    if (!values.email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.message.trim()) {
      next.message = "Please tell us about your event or request.";
    } else if (values.message.trim().length > 2000) {
      next.message = "Message must be under 2000 characters.";
    }
    return next;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "organizerRequests"), {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log("Document written with ID: ", docRef.id);
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '64px 16px',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f9fafb, #ffffff)'
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: '33%',
          right: 0,
          height: '288px',
          width: '288px',
          transform: 'translateX(33%)',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.1)',
          filter: 'blur(80px)'
        }}
      />
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          bottom: '33%',
          left: 0,
          height: '288px',
          width: '288px',
          transform: 'translateX(-33%)',
          borderRadius: '50%',
          background: 'rgba(236, 72, 153, 0.1)',
          filter: 'blur(80px)'
        }}
      />
      
      <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '24px',
            marginBottom: '48px'
          }}
          className="organizer-header"
        >
          <div style={{ maxWidth: '672px' }}>
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
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <span
                style={{
                  height: '6px',
                  width: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#7c3aed',
                  animation: 'pulse 2s infinite'
                }}
              />
              For organizers
            </span>
            <h1
              style={{
                marginTop: '16px',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '30px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#b8860b'
              }}
            >
              Turn your event into a sold-out experience.
            </h1>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                marginTop: '12px',
                fontSize: '16px',
                color: '#4b5563'
              }}
            >
              List your event, sell tickets online, and manage guests from one simple platform. Tell us what you are planning and our team will help you get started.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="organizer-grid" style={{
          display: 'grid',
          gap: '32px',
          gridTemplateColumns: '1fr'
        }}>
          {/* Left: Benefits */}
          <div className="benefits-section">
            <ul style={{ 
              display: 'grid',
              gap: '20px',
              padding: 0,
              listStyle: 'none'
            }}>
              {[
                {
                  icon: Users,
                  title: "Reach thousands",
                  description: "Put your event in front of our growing community of active ticket buyers.",
                },
                {
                  icon: Ticket,
                  title: "Flexible ticketing",
                  description: "Early bird, advanced, gate, VIP — set multiple tiers and quotas your way.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure payments",
                  description: "Accept M-Pesa, cards, and bank transfers with encrypted, instant checkout.",
                },
                {
                  icon: BarChart3,
                  title: "Real-time sales",
                  description: "Track ticket sales, revenue, and check-ins from a simple organizer dashboard.",
                },
                {
                  icon: Headphones,
                  title: "Dedicated support",
                  description: "Our team is on standby to help you launch, promote, and manage your event.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      height: '44px',
                      width: '44px',
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <Icon style={{ height: '20px', width: '20px', color: '#7c3aed' }} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#111827'
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        marginTop: '4px'
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: Contact Form */}
          <div className="form-section">
            <div style={{
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)'
            }}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#7c3aed',
                  marginBottom: '24px',
                  textDecoration: 'none'
                }}
                className="mobile-home-link"
              >
                <Ticket style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
                <span style={{ fontSize: '18px', fontWeight: 700 }}>Nimewahi</span>
              </Link>

              {isSubmitted ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    height: '64px',
                    width: '64px',
                    margin: '0 auto',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: '#d1fae5',
                    color: '#059669'
                  }}>
                    <CheckCircle style={{ height: '32px', width: '32px' }} />
                  </div>
                  <h2 style={{
                    marginTop: '24px',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#111827'
                  }}>
                    Request received
                  </h2>
                  <p style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    Thanks for reaching out. Our team will review your event details and get back to you within 24 hours.
                  </p>
                  <Link
                    to="/"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '24px',
                      borderRadius: '12px',
                      backgroundColor: '#7c3aed',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#ffffff',
                      textDecoration: 'none',
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#6d28d9';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#7c3aed';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Back to home
                    <ArrowRight style={{ height: '16px', width: '16px' }} />
                  </Link>
                </div>
              ) : (
                <>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#111827'
                  }}>
                    Partner with us
                  </h2>
                  <p style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    Share your event details and our team will handle the rest.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      marginTop: '32px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}
                    noValidate
                  >
                    {/* Full name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111827'
                        }}
                      >
                        Full name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User style={{
                          pointerEvents: 'none',
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          height: '16px',
                          width: '16px',
                          transform: 'translateY(-50%)',
                          color: '#4b5563'
                        }} />
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Jane Muthoni"
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px',
                            borderRadius: '12px',
                            border: `1px solid ${errors.fullName ? '#ef4444' : '#e5e7eb'}`,
                            backgroundColor: '#f9fafb',
                            fontSize: '14px',
                            color: '#111827',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#7c3aed';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (!errors.fullName) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        />
                      </div>
                      {errors.fullName && (
                        <p style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#ef4444'
                        }}>
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111827'
                        }}
                      >
                        Email address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail style={{
                          pointerEvents: 'none',
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          height: '16px',
                          width: '16px',
                          transform: 'translateY(-50%)',
                          color: '#4b5563'
                        }} />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px',
                            borderRadius: '12px',
                            border: `1px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                            backgroundColor: '#f9fafb',
                            fontSize: '14px',
                            color: '#111827',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#7c3aed';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (!errors.email) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        />
                      </div>
                      {errors.email && (
                        <p style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#ef4444'
                        }}>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111827'
                        }}
                      >
                        Event details *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MessageSquare style={{
                          pointerEvents: 'none',
                          position: 'absolute',
                          left: '12px',
                          top: '14px',
                          height: '16px',
                          width: '16px',
                          color: '#4b5563'
                        }} />
                        <textarea
                          id="message"
                          name="message"
                          rows={8}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your event, target audience, ticket tiers, expected attendees, location, date, and anything else you need help with."
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px',
                            borderRadius: '12px',
                            border: `1px solid ${errors.message ? '#ef4444' : '#e5e7eb'}`,
                            backgroundColor: '#f9fafb',
                            fontSize: '14px',
                            color: '#111827',
                            outline: 'none',
                            resize: 'vertical',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#7c3aed';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (!errors.message) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        />
                      </div>
                      {errors.message && (
                        <p style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#ef4444'
                        }}>
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderRadius: '12px',
                        backgroundColor: '#7c3aed',
                        padding: '14px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                        transition: 'all 0.3s ease',
                        opacity: isSubmitting ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.backgroundColor = '#6d28d9';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.backgroundColor = '#7c3aed';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span style={{
                            display: 'inline-block',
                            height: '16px',
                            width: '16px',
                            animation: 'spin 1s linear infinite',
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#ffffff'
                          }} />
                          Submitting request…
                        </>
                      ) : (
                        <>
                          Submit request
                          <Send style={{ height: '16px', width: '16px' }} />
                        </>
                      )}
                    </button>
                  </form>

                  <p style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#4b5563'
                  }}>
                    By submitting you agree to our{" "}
                    <a href="#" style={{ color: '#7c3aed', textDecoration: 'underline' }}>
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="#" style={{ color: '#7c3aed', textDecoration: 'underline' }}>
                      Privacy Policy
                    </a>
                    .
                  </p>
                </>
              )}
            </div>
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
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (min-width: 1024px) {
            .organizer-grid {
              grid-template-columns: 1fr 1fr !important;
            }
            .organizer-header {
              flex-direction: row !important;
              align-items: flex-end !important;
            }
            .mobile-home-link {
              display: none !important;
            }
          }
          
          @media (max-width: 1023px) {
            .organizer-grid {
              grid-template-columns: 1fr !important;
            }
            .benefits-section {
              order: 2;
            }
            .form-section {
              order: 1;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Organizers;