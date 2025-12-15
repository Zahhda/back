// API Configuration
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dorpay.in';
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api';

// In a development environment, we can use proxy through Vite
// which allows us to use relative paths rather than full URLs
const isDev = import.meta.env.DEV;

// Create the API URL based on environment
export const API_URL = isDev ? API_ENDPOINT : `${API_BASE_URL}${API_ENDPOINT}`;

// Log API URL configuration
console.log('API Configuration:', {
  BASE_URL: API_BASE_URL,
  ENDPOINT: API_ENDPOINT,
  FULL_URL: API_URL,
  IS_DEV: isDev
});

// Application Configuration
export const APP_PORT = import.meta.env.VITE_APP_PORT || 3000;
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Property Listing';

// Google Maps
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// User Types
export const USER_TYPES = {
  ADMIN: import.meta.env.VITE_USER_TYPE_ADMIN || 'admin',
  PROPERTY_OWNER: import.meta.env.VITE_USER_TYPE_PROPERTY_OWNER || 'property_listing',
  USER: import.meta.env.VITE_USER_TYPE_USER || 'property_searching'
};

// User Statuses
export const USER_STATUSES = {
  ACTIVE: import.meta.env.VITE_USER_STATUS_ACTIVE || 'active',
  INACTIVE: import.meta.env.VITE_USER_STATUS_INACTIVE || 'inactive',
  SUSPENDED: import.meta.env.VITE_USER_STATUS_SUSPENDED || 'suspended'
};

// User Type Labels
export const USER_TYPE_LABELS = {
  [USER_TYPES.ADMIN]: 'Super Admin',
  [USER_TYPES.PROPERTY_OWNER]: 'Property Owner',
  [USER_TYPES.USER]: 'User'
};

// Status Colors
export const STATUS_COLORS = {
  [USER_STATUSES.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [USER_STATUSES.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [USER_STATUSES.SUSPENDED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// User Type Colors
export const USER_TYPE_COLORS = {
  [USER_TYPES.ADMIN]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [USER_TYPES.PROPERTY_OWNER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [USER_TYPES.USER]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}; 