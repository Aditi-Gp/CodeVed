import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // NEW: Profile Customization (Great for public profile pages)
  profile: {
    avatar: { type: String, default: '' },
    bio: { type: String, maxLength: 200, default: '' },
    country: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },

  // NEW: User Preferences (Improves UX in the code editor)
  preferences: {
    defaultLanguage: { 
      type: String, 
      enum: ['cpp', 'java', 'python', 'javascript'], 
      default: 'cpp' 
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' }
  },

  // NEW: Competitive Gamification
  rating: { type: Number, default: 1200 }, // Standard Elo rating starting point
  title: { type: String, default: 'Novice' }, // e.g., Novice, Specialist, Expert

  // NEW: Quick reference for frontend UI (e.g., green checkmarks next to solved problems)
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],

  progress: {
    totalSolved: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date },
    topicWise: {
      Arrays: { type: Number, default: 0 },
      Strings: { type: Number, default: 0 },
      DP: { type: Number, default: 0 },
      Greedy: { type: Number, default: 0 },
      Graphs: { type: Number, default: 0 },
      BinarySearch: { type: Number, default: 0 },
    },
    difficultyWise: {
      Easy: { type: Number, default: 0 },
      Medium: { type: Number, default: 0 },
      Hard: { type: Number, default: 0 },
    },
  },
}, {
  // NEW: Automatically adds `createdAt` (for "Member Since") and `updatedAt`
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);
export default User;