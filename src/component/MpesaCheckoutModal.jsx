// src/component/MpesaCheckoutModal.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Phone, Mail, Lock, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';
import mpesaService from '../services/mpesaService';
import { auth } from '../config/firebase';

const MpesaCheckoutModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  items, 
  onSuccess, 
  onError,
  checkoutId,
  guestEmail = '',
  isGuest = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(guestEmail || '');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [statusMessage, setStatusMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setStatusMessage('');
      setIsProcessing(false);
      setCheckoutRequestId(null);
      setCountdown(0);
      setEmailError('');
      setPhoneError('');
      setNameError('');
      
      // If guest email is provided, use it
      if (guestEmail) {
        setEmail(guestEmail);
      }
      
      // Check if user is logged in
      const user = auth.currentUser;
      if (user && !user.isAnonymous) {
        // If logged in, pre-fill email from auth
        if (user.email) {
          setEmail(user.email);
        }
        if (user.displayName) {
          setFullName(user.displayName);
        }
      }
      
      // Clear any existing intervals
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [isOpen, guestEmail]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) return 'KES 0';
    return `KES ${numPrice.toLocaleString()}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    // Valid formats: 0712345678, 254712345678, +254712345678
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned;
    } else if (cleaned.startsWith('+254') && cleaned.length === 13) {
      return cleaned.substring(1);
    }
    return null;
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate phone number
    const formattedPhone = validatePhoneNumber(phoneNumber);
    if (!formattedPhone) {
      setPhoneError('Please enter a valid phone number (e.g., 0712345678)');
      isValid = false;
    } else {
      setPhoneError('');
    }
    
    // Validate email (always required for ticket delivery)
    if (!email) {
      setEmailError('Email address is required to receive your tickets');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate name (optional but recommended)
    if (!fullName) {
      setNameError('Please enter your full name');
      isValid = false;
    } else if (fullName.length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };

  const handlePayment = async () => {
    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const formattedPhone = validatePhoneNumber(phoneNumber);
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    setStatusMessage('Initiating payment...');

    try {
      // Save guest info to session storage
      if (isGuest || !auth.currentUser) {
        sessionStorage.setItem('guestEmail', email);
        sessionStorage.setItem('guestName', fullName);
        sessionStorage.setItem('guestPhone', formattedPhone);
      }

      // Initiate STK Push
      const paymentData = await mpesaService.initiateSTKPush({
        phoneNumber: formattedPhone,
        amount: amount,
        accountReference: `TICKET${Date.now().toString().slice(-8)}`,
        transactionDesc: 'Ticket Payment',
        checkoutId: checkoutId
      });

      console.log('Payment initiated:', paymentData);

      if (paymentData.data && paymentData.data.CheckoutRequestID) {
        setCheckoutRequestId(paymentData.data.CheckoutRequestID);
        setStatusMessage('Please check your phone and enter your M-Pesa PIN');
        setCountdown(180); // 3 minutes countdown

        // Start countdown timer
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Start polling for payment status
        let attempts = 0;
        const maxAttempts = 30;

        pollIntervalRef.current = setInterval(async () => {
          attempts++;
          
          try {
            const status = await mpesaService.queryPaymentStatus(
              paymentData.data.CheckoutRequestID
            );
            
            console.log('Payment status:', status);

            if (status.data && status.data.ResultCode === '0') {
              // Payment successful
              clearInterval(pollIntervalRef.current);
              clearInterval(countdownIntervalRef.current);
              
              setPaymentStatus('success');
              setStatusMessage('Payment successful! Your tickets are being processed.');
              setIsProcessing(false);
              
              // Save guest info for ticket delivery
              sessionStorage.setItem('guestEmail', email);
              sessionStorage.setItem('guestName', fullName);
              
              // Call success callback with payment data
              onSuccess({
                ...status.data,
                transactionId: paymentData.data.CheckoutRequestID,
                email: email,
                name: fullName,
                phoneNumber: formattedPhone,
                isGuest: isGuest || !auth.currentUser
              });
              
            } else if (status.data && status.data.ResultCode === '1037') {
              // Still pending
              setStatusMessage(`Waiting for M-Pesa confirmation... (${attempts}/${maxAttempts})`);
              
            } else if (status.data && status.data.ResultCode !== '1037') {
              // Payment failed
              clearInterval(pollIntervalRef.current);
              clearInterval(countdownIntervalRef.current);
              
              setPaymentStatus('error');
              setStatusMessage(status.data.ResultDesc || 'Payment failed. Please try again.');
              setIsProcessing(false);
              
              onError(new Error(status.data.ResultDesc || 'Payment failed'));
            }
            
          } catch (error) {
            console.error('Error polling status:', error);
            
            if (attempts >= maxAttempts) {
              clearInterval(pollIntervalRef.current);
              clearInterval(countdownIntervalRef.current);
              setPaymentStatus('error');
              setStatusMessage('Payment timeout. Please check your M-Pesa app for status.');
              setIsProcessing(false);
              onError(new Error('Payment timeout'));
            }
          }
        }, 3000);

        // Auto-close if not completed after 3 minutes
        setTimeout(() => {
          if (paymentStatus === 'processing') {
            clearInterval(pollIntervalRef.current);
            clearInterval(countdownIntervalRef.current);
            setPaymentStatus('error');
            setStatusMessage('Payment timed out. Please try again.');
            setIsProcessing(false);
            onError(new Error('Payment timeout'));
          }
        }, 180000);

      } else {
        throw new Error('No CheckoutRequestID received from M-Pesa');
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('error');
      setStatusMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      onError(error);
    }
  };

  const handleClose = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    onClose();
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isLoggedIn = auth.currentUser && !auth.currentUser.isAnonymous;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      padding: '16px',
      fontFamily: "'Manrope', sans-serif"
    }} onClick={handleClose}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '480px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '24px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      }} onClick={(e) => e.stopPropagation()}>
        
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <img 
              src="/mpesa-logo.png" 
              alt="M-Pesa" 
              style={{ height: '48px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              marginLeft: '8px'
            }}>
              M-Pesa Payment
            </span>
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Complete your ticket purchase using M-Pesa
          </p>
          {!isLoggedIn && (
            <div style={{
              marginTop: '8px',
              padding: '10px',
              borderRadius: '8px',
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#92400e',
                margin: 0
              }}>
                📧 <strong>Guest Checkout:</strong> Please provide your email to receive tickets
              </p>
            </div>
          )}
        </div>

        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Amount</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed' }}>
              {formatPrice(amount)}
            </span>
          </div>
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '8px',
            marginTop: '8px'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              {items.length} item{items.length > 1 ? 's' : ''} in cart
            </p>
          </div>
        </div>

        {paymentStatus === 'idle' && (
          <>
            {/* Full Name Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} />
                  Full Name
                  <span style={{ color: '#ef4444' }}>*</span>
                </div>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setNameError('');
                }}
                placeholder="Enter your full name"
                className={nameError ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${nameError ? '#ef4444' : '#d1d5db'}`,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: "'Manrope', sans-serif",
                  backgroundColor: nameError ? '#fef2f2' : 'white'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = nameError ? '#ef4444' : '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {nameError && (
                <p style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px'
                }}>
                  {nameError}
                </p>
              )}
            </div>

            {/* Email Field - Always visible */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={16} />
                  Email Address
                  <span style={{ color: '#ef4444' }}>*</span>
                </div>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="Enter your email for ticket delivery"
                className={emailError ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${emailError ? '#ef4444' : '#d1d5db'}`,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: "'Manrope', sans-serif",
                  backgroundColor: emailError ? '#fef2f2' : 'white'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = emailError ? '#ef4444' : '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {emailError && (
                <p style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px'
                }}>
                  {emailError}
                </p>
              )}
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                We'll send your tickets and confirmation to this email
              </p>
            </div>

            {/* Phone Number Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} />
                  M-Pesa Phone Number
                  <span style={{ color: '#ef4444' }}>*</span>
                </div>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                }}
                placeholder="e.g., 0712345678 or 254712345678"
                className={phoneError ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${phoneError ? '#ef4444' : '#d1d5db'}`,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  fontFamily: "'Manrope', sans-serif",
                  backgroundColor: phoneError ? '#fef2f2' : 'white'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = phoneError ? '#ef4444' : '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {phoneError && (
                <p style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px'
                }}>
                  {phoneError}
                </p>
              )}
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                Enter the phone number registered with M-Pesa
              </p>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                color: '#ffffff',
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                fontFamily: "'Manrope', sans-serif",
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #6d28d9, #5b21b6)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.25)';
              }}
            >
              <Lock size={16} />
              Pay KES {Math.round(amount).toLocaleString()}
            </button>

            <p style={{
              marginTop: '12px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#9ca3af'
            }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Secure payment via M-Pesa. Tickets will be sent to your email.
            </p>
          </>
        )}

        {paymentStatus === 'processing' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              display: 'inline-block',
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              height: '48px',
              width: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#7c3aed',
              marginBottom: '16px'
            }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Processing Payment
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '12px'
            }}>
              {statusMessage}
            </p>
            {countdown > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Clock size={16} color="#6b7280" />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Time remaining: {formatCountdown(countdown)}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: "'Manrope', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel Payment
            </button>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#d1fae5',
              color: '#065f46',
              marginBottom: '16px'
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Payment Successful! 🎉
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              {statusMessage}
            </p>
            <div style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              textAlign: 'left'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '4px 0'
              }}>
                <strong>📧 Email:</strong> {email}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '4px 0'
              }}>
                <strong>👤 Name:</strong> {fullName}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '4px 0'
              }}>
                <strong>📱 Phone:</strong> {phoneNumber}
              </p>
            </div>
            <div style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: '8px',
              background: '#d1fae5'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#065f46',
                margin: 0
              }}>
                ✅ Tickets have been sent to: <strong>{email}</strong>
              </p>
              {!isLoggedIn && (
                <p style={{
                  fontSize: '11px',
                  color: '#065f46',
                  margin: '4px 0 0 0'
                }}>
                  💡 Create an account to view your tickets anytime
                </p>
              )}
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#991b1b',
              marginBottom: '16px'
            }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Payment Failed
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              {statusMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                setPaymentStatus('idle');
                setStatusMessage('');
                setIsProcessing(false);
              }}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif",
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#6d28d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#7c3aed';
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .input-error {
              border-color: #ef4444 !important;
              background-color: #fef2f2 !important;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default MpesaCheckoutModal;