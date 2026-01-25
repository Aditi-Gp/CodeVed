/**
 * Execution API Client
 * Separate axios instance for code execution backend (port 8000)
 * This service handles code compilation and execution
 */

import axios from 'axios';
import { EXECUTION_BACKEND_URL } from './apiConfig.js';

// Create axios instance for execution backend (port 8000)
const executionApi = axios.create({
  baseURL: EXECUTION_BACKEND_URL,
  timeout: 60000, // 60 second timeout for code execution
});

// Request interceptor - add CORS headers if needed
executionApi.interceptors.request.use(
  (config) => {
    // Add any common headers here
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
executionApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Provide better error messages
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to execution service. Please ensure the backend is running on port 8000.';
    } else if (error.response?.status === 408) {
      error.message = 'Code execution timed out.';
    }
    return Promise.reject(error);
  }
);

export default executionApi;










