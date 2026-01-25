/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Distinguishes between API server (port 5000) and execution backend (port 8000)
 */

// API Server (port 5000) - handles /api/* endpoints
export const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5000';

// Execution Backend (port 8000) - handles /run endpoint
export const EXECUTION_BACKEND_URL = import.meta.env.VITE_EXECUTION_BACKEND_URL || 'http://localhost:8000';

/**
 * Get full API URL for server endpoints
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_SERVER_URL}/${cleanEndpoint}`;
};

/**
 * Get full URL for execution backend
 */
export const getExecutionUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${EXECUTION_BACKEND_URL}/${cleanEndpoint}`;
};










