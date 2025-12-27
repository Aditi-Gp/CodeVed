/**
 * Structured logging utility for production-grade online judge
 * Provides request lifecycle, compilation, runtime, and error tracking
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : LOG_LEVELS.INFO;

/**
 * Structured log entry with timestamp, level, and context
 */
function log(level, message, context = {}) {
  if (level < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
  
  const logEntry = {
    timestamp,
    level: levelName,
    message,
    ...context,
  };

  // In production, consider using a proper logging library (winston, pino)
  console.log(JSON.stringify(logEntry));
}

export const logger = {
  debug: (message, context) => log(LOG_LEVELS.DEBUG, message, context),
  info: (message, context) => log(LOG_LEVELS.INFO, message, context),
  warn: (message, context) => log(LOG_LEVELS.WARN, message, context),
  error: (message, context) => log(LOG_LEVELS.ERROR, message, context),
  
  // Request lifecycle logging
  request: (reqId, method, path, body) => {
    log(LOG_LEVELS.INFO, 'Request received', {
      requestId: reqId,
      method,
      path,
      bodySize: body ? JSON.stringify(body).length : 0,
    });
  },
  
  // Execution lifecycle
  executionStart: (reqId, language, jobId) => {
    log(LOG_LEVELS.INFO, 'Execution started', {
      requestId: reqId,
      language,
      jobId,
    });
  },
  
  compilationStart: (reqId, language, jobId) => {
    log(LOG_LEVELS.INFO, 'Compilation started', {
      requestId: reqId,
      language,
      jobId,
    });
  },
  
  compilationSuccess: (reqId, language, jobId, duration) => {
    log(LOG_LEVELS.INFO, 'Compilation successful', {
      requestId: reqId,
      language,
      jobId,
      durationMs: duration,
    });
  },
  
  compilationError: (reqId, language, jobId, error, duration) => {
    log(LOG_LEVELS.ERROR, 'Compilation failed', {
      requestId: reqId,
      language,
      jobId,
      error: error.message || error,
      durationMs: duration,
    });
  },
  
  runtimeStart: (reqId, language, jobId) => {
    log(LOG_LEVELS.INFO, 'Runtime execution started', {
      requestId: reqId,
      language,
      jobId,
    });
  },
  
  runtimeSuccess: (reqId, language, jobId, duration, outputSize) => {
    log(LOG_LEVELS.INFO, 'Runtime execution successful', {
      requestId: reqId,
      language,
      jobId,
      durationMs: duration,
      outputSize,
    });
  },
  
  runtimeError: (reqId, language, jobId, error, duration) => {
    log(LOG_LEVELS.ERROR, 'Runtime execution failed', {
      requestId: reqId,
      language,
      jobId,
      error: error.message || error,
      durationMs: duration,
    });
  },
  
  executionComplete: (reqId, language, jobId, totalDuration) => {
    log(LOG_LEVELS.INFO, 'Execution completed', {
      requestId: reqId,
      language,
      jobId,
      totalDurationMs: totalDuration,
    });
  },
  
  timeout: (reqId, language, jobId, timeoutMs) => {
    log(LOG_LEVELS.WARN, 'Execution timed out', {
      requestId: reqId,
      language,
      jobId,
      timeoutMs,
    });
  },
  
  resourceLimit: (reqId, language, jobId, limit, actual) => {
    log(LOG_LEVELS.WARN, 'Resource limit exceeded', {
      requestId: reqId,
      language,
      jobId,
      limit,
      actual,
    });
  },
};

