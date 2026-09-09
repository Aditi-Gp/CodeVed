/**
 * User Routes
 * Handles user-specific endpoints like dashboard
 */

import express from 'express';
import mongoose from 'mongoose'; // IMPORT MONGOOSE FOR ObjectId CASTING
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../../backend/utils/logger.js';

const router = express.Router();

/**
 * Get dashboard analytics for current user
 * Returns aggregated statistics and recent activity
 */
router.get('/me/dashboard', authenticate, async (req, res) => {
  const requestId = req.id || 'unknown';
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      logger.warn('Dashboard: User not found', { requestId, userId });
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get user progress
    const progress = user.progress || {
      totalSolved: 0,
      totalAttempted: 0,
      streak: 0,
      topicWise: {},
      difficultyWise: {},
    };

    // Calculate accuracy
    const accuracy = progress.totalAttempted > 0
      ? ((progress.totalSolved / progress.totalAttempted) * 100).toFixed(2)
      : '0.00';

    // Get total submissions count
    const totalSubmissions = await Submission.countDocuments({ userId });

    // Get recent submissions (last 5)
    const recentSubmissions = await Submission.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('problemName language verdict status submittedAt')
      .lean();

    const formattedSubmissions = recentSubmissions.map(sub => ({
      problemName: sub.problemName,
      language: sub.language,
      status: sub.verdict,
      submittedAt: sub.submittedAt,
    }));

    // Get joined date from user creation
    const joinedDate = user.createdAt || user._id.getTimestamp();

    // ==========================================
    // NEW: HEATMAP AGGREGATION PIPELINE
    // ==========================================
    // Only fetch data for the last 365 days to keep the query fast
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmapData = await Submission.aggregate([
      { 
        // Step 1: Filter submissions to this user from the last year
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), // Must cast to ObjectId in aggregations
          submittedAt: { $gte: oneYearAgo } 
        } 
      },
      { 
        // Step 2: Group by the calendar day
        $group: {
          // Format the Date object into a 'YYYY-MM-DD' string
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          // Count how many submissions fall on this day
          count: { $sum: 1 }
        }
      },
      { 
        // Step 3: Rename '_id' to 'date' for a cleaner frontend response
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      },
      { 
        // Step 4: Sort chronologically
        $sort: { date: 1 } 
      }
    ]);

    logger.info('Dashboard data retrieved', { requestId, userId });

    res.json({
      success: true,
      data: {
        profile: {
          name: user.username,
          email: user.email,
          joinedDate: joinedDate,
        },
        analytics: {
          totalAttempted: progress.totalAttempted || 0,
          problemsSolved: progress.totalSolved || 0,
          accuracy: parseFloat(accuracy),
          totalSubmissions: totalSubmissions,
          streakDays: progress.streak || 0,
          topicWise: progress.topicWise || {},
          difficultyWise: progress.difficultyWise || {},
        },
        heatmap: heatmapData, // Pass the aggregated data to the frontend
        recentActivity: formattedSubmissions,
      },
    });
  } catch (err) {
    logger.error('Dashboard retrieval error', {
      requestId,
      userId,
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard data',
    });
  }
});

export default router;