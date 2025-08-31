// server/models/User.js
import mongoose from 'mongoose';

// const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  progress: {
    totalSolved: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date },
    topicWise: {
      DP: { type: Number, default: 0 },
      Greedy: { type: Number, default: 0 },
      Graphs: { type: Number, default: 0 },
      BinarySearch: { type: Number, default: 0 },
      // add more topics
    },
    difficultyWise: {
      Easy: { type: Number, default: 0 },
      Medium: { type: Number, default: 0 },
      Hard: { type: Number, default: 0 },
    },
  },
});

// module.exports = mongoose.model("User", UserSchema);

const User = mongoose.model('User', UserSchema);
export default User;
