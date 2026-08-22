/**
 * Submission Model
 * Tracks user code submissions for problems
 */

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  problemName: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'java', 'python', 'javascript'],
  },
  verdict: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'error'],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
submissionSchema.index({ userId: 1, submittedAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;