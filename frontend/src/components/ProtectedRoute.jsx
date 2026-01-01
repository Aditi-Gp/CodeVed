/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Handles token validation, refresh, and redirects
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, verifyToken, refreshAccessToken } from '../utils/auth.js';

export default function ProtectedRoute({ children }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      // Check if token exists

      if (location.pathname === '/login' || location.pathname === '/register') {
        setIsValidating(false);
        setIsAuthorized(false);
        return;
      }
      
      if (!isAuthenticated()) {
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      // Verify token is valid
      const isValid = await verifyToken();
      
      if (isValid) {
        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      // Try to refresh token
      const newToken = await refreshAccessToken();
      if (newToken) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsValidating(false);
    };

    validateAuth();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}





