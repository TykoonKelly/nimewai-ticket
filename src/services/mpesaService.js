// src/services/mpesaService.js
import { auth } from '../config/firebase';

// ============================================
// M-PESA SERVICE - USING LOCALHOST
// ============================================

// ✅ Use localhost for development
const BACKEND_URL = 'http://localhost:5000';

console.log(`🔗 M-Pesa Service: Using backend at ${BACKEND_URL}`);
console.log(`📝 Make sure your backend is running on port 5000`);

class MpesaService {
  
  /**
   * Get the authentication token for API calls
   */
  async getAuthToken() {
    // Wait for auth to be ready
    if (!auth.currentUser) {
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve();
        });
      });
    }
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated. Please login first.');
    }
    
    try {
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Failed to get authentication token. Please login again.');
    }
  }

  /**
   * Make an authenticated API request
   */
  async authenticatedFetch(url, options = {}) {
    try {
      const token = await this.getAuthToken();
      
      const fullUrl = `${BACKEND_URL}${url}`;
      console.log(`📤 Making request to: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'include',
      });

      console.log(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();

    } catch (error) {
      console.error(`❌ API request failed:`, error);
      
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(`Cannot connect to server at ${BACKEND_URL}. Please ensure the backend is running.`);
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Your session has expired. Please login again.');
      }
      throw error;
    }
  }

  /**
   * Create an order
   */
  async createOrder(orderData) {
    try {
      console.log('📝 Creating order via backend...');
      return await this.authenticatedFetch('/api/order/create', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * Initiate STK Push
   */
  async initiateSTKPush({ phoneNumber, amount, accountReference, transactionDesc, checkoutId }) {
    try {
      console.log('📱 Initiating STK Push via backend...');
      
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      const requestBody = {
        phoneNumber: formattedPhone,
        amount: Math.round(amount),
        accountReference: accountReference || `TICKET${Date.now().toString().slice(-8)}`,
        transactionDesc: transactionDesc || 'Ticket Payment',
        checkoutId: checkoutId
      };

      console.log('📤 Sending payment request:', { ...requestBody, phoneNumber: formattedPhone });

      return await this.authenticatedFetch('/api/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

    } catch (error) {
      console.error('❌ Error initiating STK Push:', error);
      throw error;
    }
  }

  /**
   * Query payment status
   */
  async queryPaymentStatus(checkoutRequestID) {
    try {
      console.log('🔍 Querying payment status via backend...');
      return await this.authenticatedFetch(`/api/mpesa/status/${checkoutRequestID}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('❌ Error querying payment status:', error);
      throw error;
    }
  }

  /**
   * Get user's tickets
   */
  async getUserTickets() {
    try {
      console.log('📋 Getting user tickets via backend...');
      return await this.authenticatedFetch('/api/tickets/user', {
        method: 'GET',
      });
    } catch (error) {
      console.error('❌ Error getting tickets:', error);
      throw error;
    }
  }

  /**
   * Get a single ticket by ID
   */
  async getTicketById(ticketId) {
    try {
      console.log('🎫 Getting ticket by ID via backend...');
      return await this.authenticatedFetch(`/api/ticket/${ticketId}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('❌ Error getting ticket:', error);
      throw error;
    }
  }

  /**
   * Verify a ticket (for gate entry)
   */
  async verifyTicket(ticketId) {
    try {
      console.log('🎫 Verifying ticket via backend...');
      return await this.authenticatedFetch('/api/ticket/verify', {
        method: 'POST',
        body: JSON.stringify({ ticketId }),
      });
    } catch (error) {
      console.error('❌ Error verifying ticket:', error);
      throw error;
    }
  }

  /**
   * Cancel a ticket
   */
  async cancelTicket(ticketId) {
    try {
      console.log('❌ Cancelling ticket via backend...');
      return await this.authenticatedFetch('/api/ticket/cancel', {
        method: 'POST',
        body: JSON.stringify({ ticketId }),
      });
    } catch (error) {
      console.error('❌ Error cancelling ticket:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\s/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned;
    } else if (cleaned.startsWith('+254') && cleaned.length === 13) {
      return cleaned.substring(1);
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!auth.currentUser;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    return auth.currentUser?.uid || null;
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail() {
    return auth.currentUser?.email || null;
  }

  /**
   * Get current user name
   */
  getCurrentUserName() {
    return auth.currentUser?.displayName || 'User';
  }

  /**
   * Get the backend URL
   */
  getBackendUrl() {
    return BACKEND_URL;
  }

  /**
   * Check if backend is reachable
   */
  async checkBackendHealth() {
    try {
      console.log('🔍 Checking backend health at:', BACKEND_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend is healthy:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      
      let errorMessage = 'Cannot connect to backend server';
      if (error.name === 'AbortError') {
        errorMessage = `Connection timeout. Backend at ${BACKEND_URL} is not responding.`;
      } else if (error.message.includes('Failed to fetch') || 
                 error.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = `Backend server is not running at ${BACKEND_URL}. Please start the server on port 5000.`;
      }
      
      return { success: false, error: errorMessage };
    }
  }
}

export default new MpesaService();