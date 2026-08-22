// server/routes/problems.js
import express from 'express';
import Problem from '../models/Problem.js';

const router = express.Router();

//  ADD THIS: List all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Already existing route for fetching a problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

export default router;
