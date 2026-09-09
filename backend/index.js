/**
 * Main backend server for CodeVed Online Compiler
 * Architecture: Modular execution system with structured logging
 * Copyright: Aditi Gupta
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuid } from 'uuid';
import { generateFile } from './generateFile.js';
import { generateInputFile } from './generateInputFile.js';
import { getExecutor, isLanguageSupported, getSupportedLanguages } from './executors/index.js';
import { logger } from './utils/logger.js';
import explainRoute from './routes/explain.js';

import fetch from 'node-fetch';
import { Headers, Request, Response } from 'node-fetch';
import { Blob } from 'fetch-blob';
import { FormData } from 'formdata-node';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;

const app = express();
const PORT = process.env.PORT || 8000;

const EXECUTION_CONFIG = {
  timeout: parseInt(process.env.EXECUTION_TIMEOUT) || 10000, // 10s
  memoryLimit: parseInt(process.env.MEMORY_LIMIT) || 256 * 1024 * 1024, // 256MB
  maxOutputSize: parseInt(process.env.MAX_OUTPUT_SIZE) || 10 * 1024 * 1024, // 10MB
};

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://codeved-frontend-bucket.s3-website.eu-north-1.amazonaws.com', 'http://localhost:5173', 'https://www.codeved.org', 'https://codeved.org/'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Log CORS rejection for debugging
    logger.warn('CORS blocked request', { origin, allowedOrigins });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(bodyParser.json());

//route1
app.use('/api/explain', explainRoute);
// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = uuid();
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    online: 'compiler',
    version: '2.0.1',
    supportedLanguages: getSupportedLanguages(),
    timestamp: new Date().toISOString(),
  });
});

// Get supported languages endpoint
app.get("/languages", (req, res) => {
  res.json({
    success: true,
    languages: getSupportedLanguages(),
  });
});


app.post("/run", async (req, res) => {
  const requestId = req.id;
  const { language = 'cpp', code, input = '' } = req.body;
  
  logger.request(requestId, req.method, req.path, { language, codeLength: code?.length || 0 });

  // Input validation
  if (!code || typeof code !== 'string' || code.trim() === '') {
    logger.warn('Empty code submission', { requestId });
    return res.status(400).json({
      success: false,
      error: "Empty code! Please provide some code to execute.",
      requestId,
    });
  }

  // Validate language support
  if (!isLanguageSupported(language)) {
    logger.warn('Unsupported language requested', { requestId, language });
    return res.status(400).json({
      success: false,
      error: `Unsupported language: ${language}. Supported languages: ${getSupportedLanguages().join(', ')}`,
      requestId,
      supportedLanguages: getSupportedLanguages(),
    });
  }

  // Validate code size (prevent abuse)
  const MAX_CODE_SIZE = 100 * 1024; // 100KB
  if (code.length > MAX_CODE_SIZE) {
    logger.warn('Code size exceeded limit', { requestId, codeSize: code.length });
    return res.status(400).json({
      success: false,
      error: `Code size exceeds maximum allowed size of ${MAX_CODE_SIZE} bytes`,
      requestId,
    });
  }

  let filePath, inputPath;
  const startTime = Date.now();

  try {
    // Generate temporary files
    filePath = await generateFile(language, code);
    inputPath = await generateInputFile(input || '');

    // Get language-specific executor
    const executor = getExecutor(language, EXECUTION_CONFIG);

    // Execute code with proper error handling
    const output = await executor.execute(filePath, inputPath, requestId);

    const duration = Date.now() - startTime;
    logger.info('Request completed successfully', { requestId, language, duration });

    res.json({
      success: true,
      output: output.trim(),
      language,
      requestId,
      executionTime: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Execution failed', { 
      requestId, 
      language, 
      error: error.message, 
      duration 
    });

    // Determine error type for better user experience
    let statusCode = 500;
    let errorMessage = error.message || 'An error occurred while executing the code';

    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      statusCode = 408; // Request Timeout
      errorMessage = `Execution timed out after ${EXECUTION_CONFIG.timeout}ms`;
    } else if (error.message.includes('Compilation failed') || error.message.includes('compilation')) {
      statusCode = 400; // Bad Request (compilation error)
    } else if (error.message.includes('limit exceeded') || error.message.includes('size limit')) {
      statusCode = 413; // Payload Too Large
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      language,
      requestId,
      executionTime: duration,
    });
  } finally {
    // Cleanup temporary files (executors handle their own cleanup, but ensure input files are cleaned)
    // Note: File cleanup is handled by executors, but we can add additional cleanup here if needed
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    requestId: req.id, 
    error: err.message, 
    stack: err.stack 
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    requestId: req.id,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    supportedLanguages: getSupportedLanguages(),
  });
  console.log(` CodeVed Online Compiler Server listening on port ${PORT}!`);
  console.log(` Supported languages: ${getSupportedLanguages().join(', ')}`);
});
