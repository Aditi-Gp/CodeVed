/**
 * JWT Authentication Middleware
 * Validates JWT tokens and attaches user info to request
 * Production-grade with proper error handling and logging
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../../backend/utils/logger.js';

/**
 * Middleware to verify JWT token and attach user to request
 * Returns 401 if token is missing, invalid, or expired
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required. Please login.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      logger.warn('Authentication failed: Empty token', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token format' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warn('Authentication failed: Token expired', {
          path: req.path,
          method: req.method,
          ip: req.ip,
        });
        return res.status(401).json({ 
          success: false,
          error: 'Token expired. Please login again.',
          expired: true,
        });
      } else if (err.name === 'JsonWebTokenError') {
        logger.warn('Authentication failed: Invalid token', {
          path: req.path,
          method: req.method,
          ip: req.ip,
        });
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token' 
        });
      }
      throw err;
    }

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn('Authentication failed: User not found', {
        userId: decoded.id,
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Attach user to request for use in route handlers
    req.user = user;
    req.userId = decoded.id;

    logger.info('Authentication successful', {
      userId: decoded.id,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      path: req.path,
      method: req.method,
      stack: error.stack,
    });
    res.status(500).json({ 
      success: false,
      error: 'Authentication error' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid token exists
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          req.userId = decoded.id;
        }
      } catch (err) {
        // Silently fail for optional auth
      }
    }
    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
};

