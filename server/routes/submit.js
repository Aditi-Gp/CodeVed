// server/routes/submit.js
import express from 'express';
import Problem from '../models/Problem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { executeCpp } from '../../backend/executeCpp.js'; 

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../../backend/inputs');
const codePath = path.join(__dirname, '../../backend/codes');

if (!fs.existsSync(inputPath)) fs.mkdirSync(inputPath, { recursive: true });
if (!fs.existsSync(codePath)) fs.mkdirSync(codePath, { recursive: true });

router.post('/:id', async (req, res) => {
  const { code } = req.body;
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const results = [];

    for (const testCase of problem.testCases) {
      const jobId = uuid();
      const sourcePath = path.join(codePath, `${jobId}.cpp`);
      const inputFilePath = path.join(inputPath, `${jobId}.txt`);

      fs.writeFileSync(sourcePath, code);
      fs.writeFileSync(inputFilePath, testCase.input);

      try {
        const output = await executeCpp(sourcePath, inputFilePath);
        const actual = output.trim();
        const expected = testCase.output.trim();
        const passed = actual === expected;

        results.push({ input: testCase.input, expected, actual, passed });
      } catch (err) {
        results.push({ input: testCase.input, expected: testCase.output, actual: err.message, passed: false });
      }
    }

    const passedAll = results.every(r => r.passed);
    res.json({ verdict: passedAll ? 'Accepted' : 'Wrong Answer', results });
  } catch (err) {
    console.error('Backend error during submission:', err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

export default router;
