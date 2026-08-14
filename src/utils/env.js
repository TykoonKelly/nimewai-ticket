// src/utils/env.js

/**
 * Universal environment variable handler
 * Works with both Vite (import.meta.env) and CRA (process.env)
 */
class EnvManager {
  constructor() {
    this.env = this.detectEnvironment();
    this.variables = this.loadVariables();
  }

  /**
   * Detect which environment we're running in
   */
  detectEnvironment() {
    // Check for Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return 'vite';
    }
    // Check for Create React App
    if (typeof process !== 'undefined' && process.env) {
      return 'cra';
    }
    // Fallback
    return 'unknown';
  }

  /**
   * Load environment variables based on the environment
   */
  loadVariables() {
    const vars = {};

    if (this.env === 'vite') {
      // Vite environment - variables must start with VITE_
      vars.BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      vars.FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
      vars.FIREBASE_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
      vars.FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      vars.FIREBASE_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
      vars.FIREBASE_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
      vars.FIREBASE_APP_ID = import.meta.env.VITE_FIREBASE_APP_ID;
      vars.FIREBASE_MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
      vars.NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';
      
      console.log('🔧 Running in Vite environment');
    } else if (this.env === 'cra') {
      // CRA environment - variables must start with REACT_APP_
      vars.BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      vars.FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
      vars.FIREBASE_AUTH_DOMAIN = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
      vars.FIREBASE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
      vars.FIREBASE_STORAGE_BUCKET = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
      vars.FIREBASE_MESSAGING_SENDER_ID = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
      vars.FIREBASE_APP_ID = process.env.REACT_APP_FIREBASE_APP_ID;
      vars.FIREBASE_MEASUREMENT_ID = process.env.REACT_APP_FIREBASE_MEASUREMENT_ID;
      vars.NODE_ENV = process.env.NODE_ENV || 'development';
      
      console.log('🔧 Running in Create React App environment');
    } else {
      // Unknown environment - use default values
      console.warn('⚠️ Unknown environment, using default values');
      vars.BACKEND_URL = 'http://localhost:5000';
      vars.NODE_ENV = 'development';
    }

    return vars;
  }

  /**
   * Get a specific environment variable
   */
  get(key) {
    return this.variables[key];
  }

  /**
   * Get all environment variables
   */
  getAll() {
    return this.variables;
  }

  /**
   * Check if we're in development mode
   */
  isDevelopment() {
    return this.variables.NODE_ENV === 'development';
  }

  /**
   * Check if we're in production mode
   */
  isProduction() {
    return this.variables.NODE_ENV === 'production';
  }

  /**
   * Get the environment name
   */
  getEnvironment() {
    return this.env;
  }
}

// Create a singleton instance
const env = new EnvManager();

export default env;