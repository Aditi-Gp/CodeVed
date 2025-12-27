/**
 * Main Server File
 * Production-grade Express server with authentication, rate limiting, and structured logging
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import problemRoutes from './routes/problems.js';
import authRoutes from './routes/auth.js';
import submitRoutes from './routes/submit.js';
import explainRoutes from './routes/explain.js';
import { rateLimiters } from './middleware/rateLimiter.js';
import { logger } from '../backend/utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = uuid();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://codeved-frontend-bucket.s3-website.eu-north-1.amazonaws.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes with rate limiting
app.use('/api/auth', authRoutes);
app.use('/api/submit', rateLimiters.execution, submitRoutes);
app.use('/api/problems', rateLimiters.api, problemRoutes);
app.use('/api/explain', explainRoutes); // Rate limiting handled in route

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    requestId: req.id, 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    requestId: req.id,
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { 
    requestId: req.id, 
    path: req.path, 
    method: req.method 
  });
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    requestId: req.id,
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected successfully', {});
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    logger.error('MongoDB connection failed', { 
      error: err.message,
      stack: err.stack 
    });
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development' 
  });
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

