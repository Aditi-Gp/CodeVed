/**
 * Rate Limiting Middleware
 * Prevents abuse and controls API costs
 * Uses in-memory store (for production, consider Redis)
 */

import { logger } from '../../backend/utils/logger.js';

// In-memory rate limit store
// For production, use Redis or similar distributed cache
const rateLimitStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limit configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.message - Custom error message
 * @param {Function} options.keyGenerator - Function to generate rate limit key
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 10, // 10 requests per window default
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => {
      // Default: rate limit by IP + path
      return `${req.ip}:${req.path}`;
    },
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(key);
    
    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    }

    record.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    if (record.count > maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        count: record.count,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000), // seconds
      });
    }

    next();
  };
};

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limiter for auth endpoints (prevent brute force)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
    keyGenerator: (req) => `auth:${req.ip}`,
  }),

  // Moderate rate limiter for API endpoints
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'API rate limit exceeded. Please slow down.',
    keyGenerator: (req) => `api:${req.ip}:${req.path}`,
  }),

  // Strict rate limiter for AI explanation (cost control)
  ai: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 AI calls per minute per user
    message: 'AI explanation rate limit exceeded. Please wait before requesting another explanation.',
    keyGenerator: (req) => {
      // Rate limit by user if authenticated, otherwise by IP
      const userId = req.userId || req.ip;
      return `ai:${userId}`;
    },
  }),

  // Rate limiter for code execution
  execution: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 executions per minute
    message: 'Code execution rate limit exceeded. Please slow down.',
    keyGenerator: (req) => {
      const userId = req.userId || req.ip;
      return `execution:${userId}`;
    },
  }),
};











