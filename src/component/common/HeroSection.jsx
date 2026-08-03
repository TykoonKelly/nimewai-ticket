import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, Calendar, MapPin, ArrowRight, Loader } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({
    events: '12+',
    organizers: '10+',
    tickets: '100+'
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          events: '12+',
          organizers: '10+',
          tickets: '100+'
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/events?category=${encodeURIComponent(tag)}`);
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <section style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 30%, #f5f3ff 60%, #faf5ff 100%)',
      padding: isMobile ? '20px 16px' : '40px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Manrope', sans-serif"
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-200px',
        right: '-200px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      {/* Floating Ticket Icons - Hide on mobile */}
      {!isMobile && (
        <>
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            fontSize: '60px',
            opacity: 0.1,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }}>🎫</div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '8%',
            fontSize: '80px',
            opacity: 0.08,
            transform: 'rotate(20deg)',
            pointerEvents: 'none'
          }}>🎫</div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            fontSize: '40px',
            opacity: 0.06,
            transform: 'rotate(-30deg)',
            pointerEvents: 'none'
          }}>✨</div>
        </>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '40px' : '60px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Column - Text Content */}
        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          order: isMobile ? 1 : 0
        }}>
          {/* Live Events Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(124, 58, 237, 0.1)',
            padding: '6px 16px 6px 12px',
            borderRadius: '50px',
            marginBottom: '20px',
            border: '1px solid rgba(124, 58, 237, 0.15)'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              background: '#7c3aed',
              borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <span style={{
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: 600,
              color: '#7c3aed',
              letterSpacing: '0.5px'
            }}>
              Events All Round
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: isMobile ? '36px' : isTablet ? '46px' : '58px',
            fontWeight: 800,
            color: '#b8860b',
            lineHeight: 1.1,
            marginBottom: '16px',
            letterSpacing: '-1.5px'
          }}>
            {isMobile ? (
              <>
                Discover Events <br />
                <span style={{
                  background: 'linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Curated For You
                </span>
              </>
            ) : (
              <>
                Discover Events
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Curated For You
                </span>
              </>
            )}
          </h1>

          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: isMobile ? '15px' : '18px',
            lineHeight: 1.8,
            color: '#6b7280',
            maxWidth: '500px',
            marginBottom: '24px',
            fontWeight: 400
          }}>
            Explore events centered within your interest.
            Easily secure your ticket to your event of choice.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            maxWidth: '550px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <Search style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '18px',
                height: '18px'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, artists, or venues..."
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px 0 42px',
                  borderRadius: '50px',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  background: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: isMobile ? '0 20px' : '0 28px',
                height: '48px',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: "'Manrope', sans-serif",
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
                whiteSpace: 'nowrap',
                cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                opacity: isSearching || !searchQuery.trim() ? 0.6 : 1,
                width: isMobile ? '100%' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (!isSearching && searchQuery.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.45)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.35)';
              }}
            >
              {isSearching ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Find Tickets</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Filters / Trending Tags */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            fontSize: '13px',
            fontFamily: "'Manrope', sans-serif",
            color: '#6b7280'
          }}>
            <span style={{ fontWeight: 600 }}>Trending:</span>
            {["Fitness", "Dance", "Wellness", "Music", "Sports"].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                style={{
                  padding: '4px 14px',
                  borderRadius: '50px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(124, 58, 237, 0.1)',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: "'Manrope', sans-serif",
                  color: '#4b5563',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.color = '#7c3aed';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.1)';
                  e.currentTarget.style.color = '#4b5563';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Dynamic Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '16px' : '48px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(124, 58, 237, 0.08)'
          }}>
            <div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: 800,
                color: '#1f2937'
              }}>
                {isLoadingStats ? (
                  <span style={{ 
                    display: 'inline-block', 
                    width: '60px', 
                    height: '28px', 
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                ) : (
                  stats.events
                )}
              </div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? '12px' : '14px',
                color: '#6b7280',
                fontWeight: 400
              }}>
                Events Listed
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: 800,
                color: '#1f2937'
              }}>
                {isLoadingStats ? (
                  <span style={{ 
                    display: 'inline-block', 
                    width: '60px', 
                    height: '28px', 
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                ) : (
                  stats.organizers
                )}
              </div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? '12px' : '14px',
                color: '#6b7280',
                fontWeight: 400
              }}>
                Organizers
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: 800,
                color: '#1f2937'
              }}>
                {isLoadingStats ? (
                  <span style={{ 
                    display: 'inline-block', 
                    width: '60px', 
                    height: '28px', 
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                ) : (
                  stats.tickets
                )}
              </div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: isMobile ? '12px' : '14px',
                color: '#6b7280',
                fontWeight: 400
              }}>
                Tickets Sold
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Wheezfit Event with Poster */}
        {!isMobile && (
          <div style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDelay: '0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px'
            }}>
              {/* Event Card with Poster Image */}
              <div style={{
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.05)',
                position: 'relative',
                transition: 'all 0.3s ease',
                fontFamily: "'Manrope', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 30px 80px rgba(124, 58, 237, 0.2), 0 0 0 2px rgba(124, 58, 237, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.05)';
              }}>
                {/* Event Poster Image */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
                  overflow: 'hidden'
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop"
                    alt="Wheezfit Dance Fitness"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                  }} />
                  
                  {/* Overlay Content */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    color: 'white'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(124, 58, 237, 0.9)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '50px',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      <Calendar size={14} />
                      <span>EVERY SATURDAY</span>
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Wheezfit Dance Fitness
                    </div>
                    <div style={{
                      fontSize: '13px',
                      opacity: 0.9,
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <MapPin size={14} />
                      AV Fitness, Mbaazi Rd
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div style={{
                  padding: isTablet ? '20px 24px' : '24px 32px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#7c3aed',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        AV Fitness
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#b8860b'
                      }}>
                        Drop-in Session
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      color: 'white',
                      padding: '4px 14px',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      AVAILABLE
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '2px dashed rgba(124, 58, 237, 0.1)'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Ticket 
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1f2937'
                      }}>
                        ADMITS ONE
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Price
                      </div>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Ksh 1,000.00
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Tear-off effect */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  gap: '8px',
                  opacity: 0.05,
                  pointerEvents: 'none'
                }}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} style={{
                      width: '4px',
                      height: '4px',
                      background: '#7c3aed',
                      borderRadius: '50%'
                    }} />
                  ))}
                </div>
              </div>

              {/* Floating Decorative Elements */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '40px',
                animation: 'float 3s ease-in-out infinite'
              }}>
                💃
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '-30px',
                fontSize: '30px',
                animation: 'float 3.5s ease-in-out infinite reverse'
              }}>
                🎵
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;