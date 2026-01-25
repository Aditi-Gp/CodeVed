/**
 * AI Code Explanation Route
 * Production-grade with rate limiting, cost control, retries, and fallbacks
 * Uses OpenAI API v4 (latest) with proper error handling
 */

import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';
import { logger } from '../backend/utils/logger.js';

dotenv.config();

const router = express.Router();

// Initialize OpenAI client with latest API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const AI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500, // Limit tokens to control costs
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
};

// Request deduplication - prevent race conditions
const pendingRequests = new Map();

/**
 * Delay utility for retries
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry logic with exponential backoff
 */
async function callWithRetry(apiCall, retries = AI_CONFIG.maxRetries, requestId = '') {
  try {
    return await apiCall();
  } catch (err) {
    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (err.status >= 400 && err.status < 500 && err.status !== 429) {
      throw err;
    }

    if (retries > 0) {
      const wait = AI_CONFIG.retryDelay * Math.pow(2, AI_CONFIG.maxRetries - retries);
      logger.warn('AI API retry', { 
        requestId, 
        retriesLeft: retries - 1, 
        waitMs: wait,
        error: err.message 
      });
      await delay(wait);
      return callWithRetry(apiCall, retries - 1, requestId);
    }
    throw err;
  }
}

/**
 * Generate code explanation using OpenAI
 */
router.post('/', rateLimiters.ai, optionalAuth, async (req, res) => {
  const requestId = req.id || 'unknown';
  const { code, language = 'unknown' } = req.body;
  const userId = req.userId || req.ip;

  logger.info('AI explanation request', { 
    requestId, 
    userId, 
    codeLength: code?.length || 0,
    language 
  });

  // Input validation
  if (!code || typeof code !== 'string' || code.trim() === '') {
    logger.warn('AI explanation failed: No code provided', { requestId });
    return res.status(400).json({ 
      success: false,
      error: 'No code provided' 
    });
  }

  // Limit code size to prevent excessive API costs
  const MAX_CODE_SIZE = 5000; // characters
  if (code.length > MAX_CODE_SIZE) {
    logger.warn('AI explanation failed: Code too long', { 
      requestId, 
      codeLength: code.length 
    });
    return res.status(400).json({ 
      success: false,
      error: `Code is too long. Maximum ${MAX_CODE_SIZE} characters allowed.` 
    });
  }

  // Check for duplicate requests (prevent race conditions)
  const requestKey = `${userId}:${code.substring(0, 100)}`; // Hash-like key
  if (pendingRequests.has(requestKey)) {
    logger.info('Duplicate AI request detected, returning pending result', { requestId });
    return pendingRequests.get(requestKey);
  }

  // Create promise for this request
  const explanationPromise = (async () => {
    try {
      const systemPrompt = `You are a helpful code explainer. Explain the following ${language} code in a clear, concise manner. Focus on:
1. What the code does
2. Key algorithms or patterns used
3. Important details

Keep the explanation under 300 words.`;

      const completion = await callWithRetry(
        () => openai.chat.completions.create({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: code },
          ],
          max_tokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
        }),
        AI_CONFIG.maxRetries,
        requestId
      );

      const explanation = completion.choices[0]?.message?.content || 'No explanation generated.';

      logger.info('AI explanation generated successfully', { 
        requestId, 
        userId,
        tokensUsed: completion.usage?.total_tokens || 0,
        explanationLength: explanation.length 
      });

      // Remove from pending requests
      pendingRequests.delete(requestKey);

      return res.json({ 
        success: true,
        explanation,
        tokensUsed: completion.usage?.total_tokens || 0,
      });
    } catch (err) {
      // Remove from pending requests on error
      pendingRequests.delete(requestKey);

      logger.error('AI explanation error', { 
        requestId, 
        userId,
        error: err.message,
        status: err.status,
        stack: err.stack 
      });

      // Provide user-friendly error messages
      let errorMessage = 'Failed to generate explanation. Please try again later.';
      let statusCode = 500;

      if (err.status === 429) {
        errorMessage = 'AI service is currently busy. Please try again in a moment.';
        statusCode = 429;
      } else if (err.status === 401 || err.status === 403) {
        errorMessage = 'AI service configuration error.';
        statusCode = 503;
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait before requesting another explanation.';
        statusCode = 429;
      }

      return res.status(statusCode).json({ 
        success: false,
        error: errorMessage,
        retryable: statusCode === 429 || statusCode === 500,
      });
    }
  })();

  // Store promise to handle duplicate requests
  pendingRequests.set(requestKey, explanationPromise);

  // Clean up after 30 seconds (prevent memory leak)
  setTimeout(() => {
    pendingRequests.delete(requestKey);
  }, 30000);

  return explanationPromise;
});

export default router;
