import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configure axios with authentication token
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Response with user data and token
 */
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Response with created user data
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Response with success or error message
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset password token
 * @param {string} password - New password
 * @returns {Promise} Response with success or error message
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify authentication token
 * @returns {Promise} Response with validation result
 */
export const verifyToken = async () => {
  try {
    const response = await authAxios.get(`${API_URL}/auth/verify-token`);
    return response.data;
  } catch (error) {
    // Clear localStorage if token is invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
};

/**
 * Logout user (clear local storage)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}; 