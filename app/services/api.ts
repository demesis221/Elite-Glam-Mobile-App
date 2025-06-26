import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for your API
const API_URL = 'https://elite-glam-mobile-app-7qv7.onrender.com'; // Production backend URL

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'auth_token';

export const setAuthToken = async (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from secure storage if not already set
    if (!config.headers.Authorization) {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Here you could add token refresh logic if needed
        // const refreshToken = await SecureStore.getItemAsync('refresh_token');
        // const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        // await setAuthToken(data.token);
        // originalRequest.headers.Authorization = `Bearer ${data.token}`;
        // return api(originalRequest);
      } catch (error) {
        // If refresh fails, clear auth and redirect to login
        await setAuthToken('');
        // You can add navigation logic here if needed
        // router.replace('/login');
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('API Error Response:', error.response.data);
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    return 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request
    console.error('API Error:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};
