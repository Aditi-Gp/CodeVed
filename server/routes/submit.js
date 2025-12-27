/**
 * Submission route - Handles problem submissions with multi-language support
 * Uses the new modular executor system for secure, sandboxed execution
 */

import express from 'express';
import Problem from '../models/Problem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { getExecutor, isLanguageSupported } from '../../backend/executors/index.js';
import { generateFile } from '../../backend/generateFile.js';
import { generateInputFile } from '../../backend/generateInputFile.js';
import { logger } from '../../backend/utils/logger.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../../backend/inputs');
const codePath = path.join(__dirname, '../../backend/codes');

if (!fs.existsSync(inputPath)) fs.mkdirSync(inputPath, { recursive: true });
if (!fs.existsSync(codePath)) fs.mkdirSync(codePath, { recursive: true });

// Execution configuration
const EXECUTION_CONFIG = {
  timeout: 10000, // 10s per test case
  memoryLimit: 256 * 1024 * 1024, // 256MB
  maxOutputSize: 10 * 1024 * 1024, // 10MB
};

/**
 * Submit solution to a problem
 * Requires authentication
 * Rate limited to prevent abuse
 */
router.post('/:id', authenticate, async (req, res) => {
  const requestId = req.id || uuid();
  const { code, language = 'cpp' } = req.body;
  const { id } = req.params;
  const userId = req.userId;

  logger.info('Submission request', { 
    requestId, 
    problemId: id, 
    language, 
    userId,
    codeLength: code?.length || 0 
  });

  // Input validation
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return res.status(400).json({ 
      error: 'Empty code! Please provide code to submit.',
      requestId,
    });
  }

  // Validate language support
  if (!isLanguageSupported(language)) {
    return res.status(400).json({ 
      error: `Unsupported language: ${language}`,
      requestId,
    });
  }

  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      logger.warn('Problem not found', { requestId, problemId: id });
      return res.status(404).json({ error: 'Problem not found', requestId });
    }

    logger.info('Processing submission', { 
      requestId, 
      problemId: id, 
      language, 
      testCasesCount: problem.testCases.length 
    });

    const results = [];
    const executor = getExecutor(language, EXECUTION_CONFIG);

    // Process each test case
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      const testCaseId = `${requestId}-${i}`;
      
      logger.info('Processing test case', { requestId, testCaseId, testCaseIndex: i });

      let filePath, inputFilePath;

      try {
        // Generate files for this test case
        filePath = await generateFile(language, code);
        inputFilePath = await generateInputFile(testCase.input);

        // Execute code
        const output = await executor.execute(filePath, inputFilePath, testCaseId);
        const actual = output.trim();
        const expected = testCase.output.trim();
        const passed = actual === expected;

        results.push({ 
          input: testCase.input, 
          expected, 
          actual, 
          passed,
          testCaseIndex: i,
        });

        logger.info('Test case completed', { 
          requestId, 
          testCaseId, 
          passed,
          testCaseIndex: i,
        });

        // Cleanup files
        try {
          if (filePath && fs.existsSync(filePath)) await fs.promises.unlink(filePath);
          if (inputFilePath && fs.existsSync(inputFilePath)) await fs.promises.unlink(inputFilePath);
        } catch (cleanupErr) {
          logger.warn('Cleanup failed', { requestId, testCaseId, error: cleanupErr.message });
        }
      } catch (err) {
        logger.error('Test case execution failed', { 
          requestId, 
          testCaseId, 
          error: err.message,
          testCaseIndex: i,
        });

        results.push({ 
          input: testCase.input, 
          expected: testCase.output, 
          actual: err.message, 
          passed: false,
          testCaseIndex: i,
        });

        // Cleanup on error
        try {
          if (filePath && fs.existsSync(filePath)) await fs.promises.unlink(filePath);
          if (inputFilePath && fs.existsSync(inputFilePath)) await fs.promises.unlink(inputFilePath);
        } catch (cleanupErr) {
          // Ignore cleanup errors
        }
      }
    }

    const passedAll = results.every(r => r.passed);
    const verdict = passedAll ? 'Accepted' : 'Wrong Answer';

    logger.info('Submission completed', { 
      requestId, 
      problemId: id, 
      language, 
      verdict,
      passedTests: results.filter(r => r.passed).length,
      totalTests: results.length,
    });

    res.json({ 
      verdict, 
      results,
      language,
      requestId,
    });
  } catch (err) {
    logger.error('Submission failed', { 
      requestId, 
      problemId: id, 
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ 
      error: 'Submission failed', 
      requestId,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
