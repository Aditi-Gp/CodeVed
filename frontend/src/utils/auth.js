/**
 * Authentication Utilities
 * Handles token storage, validation, and refresh
 */

import { API_SERVER_URL } from './apiConfig.js';

const BACKEND_URL = API_SERVER_URL;

/**
 * Get stored token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Store tokens
 */
export const setTokens = (token, refreshToken, user) => {
  if (token) localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    if (user.id) localStorage.setItem('userId', user.id);
  }
};

/**
 * Clear all auth data
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Refresh access token using refresh token
 * Returns new token or null if refresh fails
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data.token;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

/**
 * Verify token is still valid
 */
export const verifyToken = async () => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success !== true) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }    
    return data.success === true;
    
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

