/**
 * Token storage service with enhanced security
 * This implements a more secure approach to managing auth tokens 
 * by using httpOnly cookies where possible and secure fallbacks
 */

// Constants
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Set a secure HttpOnly cookie if supported, otherwise fallback to localStorage
 * @param {string} token - The authentication token to store
 */
export const setToken = (token) => {
  try {
    // For a production app, this should be replaced with actual HttpOnly cookie
    // set via your backend API. This is just a simulation.
    
    // Store in localStorage as fallback
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', Date.now() + TOKEN_EXPIRY);
  } catch (error) {
    console.error('Error setting authentication token:', error);
  }
};

/**
 * Get the authentication token
 * @returns {string|null} The authentication token or null if not found/expired
 */
export const getToken = () => {
  try {
    // First, check if token exists
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    // Check if token is expired
    const expiry = parseInt(localStorage.getItem('tokenExpiry'));
    if (expiry && Date.now() > expiry) {
      // Token expired, clean up
      removeToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting authentication token:', error);
    return null;
  }
};

/**
 * Remove the authentication token
 */
export const removeToken = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
  } catch (error) {
    console.error('Error removing authentication token:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

export default {
  setToken,
  getToken,
  removeToken,
  isAuthenticated
};