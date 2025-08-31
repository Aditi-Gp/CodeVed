// routes/submission.js
const User = require("../models/User");
const Problem = require("../models/Problem");

router.post("/submit", async (req, res) => {
  const { userId, problemId, code, language } = req.body;

  // Evaluate submission (already implemented in your system)
  const result = await evaluateCode(problemId, code, language);

  const problem = await Problem.findById(problemId);
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  user.progress.totalAttempted += 1;

  if (result === "Accepted") {
    user.progress.totalSolved += 1;

    // Update topic-wise stats
    problem.topics.forEach((t) => {
      user.progress.topicWise[t] += 1;
    });

    // Update difficulty stats
    user.progress.difficultyWise[problem.difficulty] += 1;

    // Update streak
    const today = new Date().toDateString();
    if (user.progress.lastSolvedDate === today) {
      // same day, streak continues
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        new Date(user.progress.lastSolvedDate).toDateString() ===
        yesterday.toDateString()
      ) {
        user.progress.streak += 1;
      } else {
        user.progress.streak = 1;
      }
    }
    user.progress.lastSolvedDate = new Date();
  }

  await user.save();

  res.json({ result, progress: user.progress });
});
