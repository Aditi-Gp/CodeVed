/**
 * Authentication Routes
 * Production-grade auth with proper validation, logging, and security
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../../backend/utils/logger.js';

const router = express.Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // 24 hours default
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days for refresh token

/**
 * Register new user
 * Rate limited to prevent abuse
 */
router.post('/register', rateLimiters.auth, async (req, res) => {
  const requestId = req.id || 'unknown';
  const { username, email, password } = req.body;

  logger.info('Registration attempt', { requestId, email, username: username?.substring(0, 3) + '***' });

  // Input validation
  if (!username || !email || !password) {
    logger.warn('Registration failed: Missing fields', { requestId });
    return res.status(400).json({ 
      success: false,
      error: 'Please fill in all fields' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.warn('Registration failed: Invalid email format', { requestId, email });
    return res.status(400).json({ 
      success: false,
      error: 'Invalid email format' 
    });
  }

  // Validate password strength
  if (password.length < 6) {
    logger.warn('Registration failed: Weak password', { requestId });
    return res.status(400).json({ 
      success: false,
      error: 'Password must be at least 6 characters long' 
    });
  }

  // Validate username
  if (username.length < 3 || username.length > 20) {
    logger.warn('Registration failed: Invalid username length', { requestId });
    return res.status(400).json({ 
      success: false,
      error: 'Username must be between 3 and 20 characters' 
    });
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      logger.warn('Registration failed: User already exists', { requestId, email });
      return res.status(400).json({ 
        success: false,
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password with bcrypt
    const hashed = await bcrypt.hash(password, 12); // Increased rounds for better security

    // Create user
    const user = new User({ username, email, password: hashed });
    await user.save();

    // Generate JWT tokens
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id, type: 'refresh' }, JWT_SECRET, { 
      expiresIn: JWT_REFRESH_EXPIRES_IN 
    });

    logger.info('User registered successfully', { requestId, userId: user._id, email });

    res.json({ 
      success: true,
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    logger.error('Registration error', { 
      requestId, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ 
      success: false,
      error: 'Server error during registration' 
    });
  }
});

/**
 * Login user
 * Rate limited to prevent brute force attacks
 */
router.post('/login', rateLimiters.auth, async (req, res) => {
  const requestId = req.id || 'unknown';
  const { email, password } = req.body;

  logger.info('Login attempt', { requestId, email });

  if (!email || !password) {
    logger.warn('Login failed: Missing fields', { requestId });
    return res.status(400).json({ 
      success: false,
      error: 'Please fill in all fields' 
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed: User not found', { requestId, email });
      // Don't reveal if user exists for security
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login failed: Invalid password', { requestId, email, userId: user._id });
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT tokens
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id, type: 'refresh' }, JWT_SECRET, { 
      expiresIn: JWT_REFRESH_EXPIRES_IN 
    });

    logger.info('Login successful', { requestId, userId: user._id, email });

    res.json({ 
      success: true,
      token, 
      refreshToken,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    logger.error('Login error', { 
      requestId, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ 
      success: false,
      error: 'Server error during login' 
    });
  }
});

/**
 * Refresh JWT token
 * Allows clients to get new access token without re-authenticating
 */
router.post('/refresh', async (req, res) => {
  const requestId = req.id || 'unknown';
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ 
      success: false,
      error: 'Refresh token required' 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      logger.warn('Invalid refresh token type', { requestId });
      return res.status(401).json({ 
        success: false,
        error: 'Invalid refresh token' 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Generate new access token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    logger.info('Token refreshed', { requestId, userId: user._id });

    res.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired refresh token' 
      });
    }
    logger.error('Token refresh error', { requestId, error: err.message });
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

/**
 * Verify token endpoint
 * Allows frontend to check if token is still valid
 */
router.get('/verify', authenticate, async (req, res) => {
  const requestId = req.id || 'unknown';
  logger.info('Token verification attempt', { requestId });
  res.json({ 
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});
/**
 * Get user progress
 * Protected route - requires authentication
 */
router.get("/:id/progress", authenticate, async (req, res) => {
  const requestId = req.id || 'unknown';
  
  // Ensure user can only access their own progress
  if (req.params.id !== req.userId.toString()) {
    logger.warn('Unauthorized progress access attempt', { 
      requestId, 
      requestedId: req.params.id, 
      userId: req.userId 
    });
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden' 
    });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    logger.info('Progress retrieved', { requestId, userId: req.params.id });

    res.json({ 
      success: true,
      progress: user.progress 
    });
  } catch (err) {
    logger.error('Progress retrieval error', { 
      requestId, 
      error: err.message 
    });
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

export default router;