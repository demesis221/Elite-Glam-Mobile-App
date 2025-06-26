import { Platform } from 'react-native';

type PlatformType = 'android' | 'ios' | 'web';

// Export the API URL from environment variable, fallback to Render URL if not set
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://elite-glam-mobile-app-7qv7.onrender.com';

// If you need getBestApiUrl, use this:
export function getBestApiUrl() { return API_URL; }

// Log API URL for debugging
console.log('Using API URL:', API_URL);

// Export other API-related configurations
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Base API configuration
export const BASE_API_CONFIG = {
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
};