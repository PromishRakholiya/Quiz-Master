const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, array, or ObjectId
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  marksAwarded: {
    type: Number,
    required: true,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: true });

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'time-expired'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  submissionTime: {
    type: Date,
    default: null
  },
  timeAllowed: {
    type: Number, // in minutes
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  rank: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  browserInfo: {
    name: String,
    version: String,
    os: String
  },
  cheatingFlags: [{
    type: {
      type: String,
      enum: ['tab-switch', 'window-blur', 'copy-paste', 'right-click', 'dev-tools', 'multiple-tabs']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  reviewData: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewNotes: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
attemptSchema.index({ userId: 1, quizId: 1 });
attemptSchema.index({ quizId: 1, score: -1 }); // For leaderboard
attemptSchema.index({ userId: 1, createdAt: -1 }); // For user history
attemptSchema.index({ status: 1, createdAt: -1 });
attemptSchema.index({ quizId: 1, status: 1, score: -1 });

// Ensure unique attempt numbers per user per quiz
attemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });

// Virtual for duration in minutes
attemptSchema.virtual('durationInMinutes').get(function() {
  return Math.round(this.timeSpent / 60);
});

// Virtual for remaining time
attemptSchema.virtual('remainingTime').get(function() {
  if (this.status !== 'in-progress') return 0;
  
  const elapsed = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  const allowed = this.timeAllowed * 60;
  return Math.max(0, allowed - elapsed);
});

// Pre-save middleware
attemptSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
  }

  // Set end time when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.endTime) {
    this.endTime = new Date();
    this.submissionTime = new Date();
  }

  // Calculate time spent
  if (this.endTime && this.startTime) {
    this.timeSpent = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }

  next();
});

// Post-save middleware to update quiz statistics
attemptSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    try {
      const Quiz = mongoose.model('Quiz');
      await Quiz.updateStatistics(doc.quizId);
      
      // Update question statistics
      const Question = mongoose.model('Question');
      for (const answer of doc.answers) {
        await Question.updateStatistics(answer.questionId, answer.isCorrect, answer.timeSpent);
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }
});

// Instance method to calculate score
attemptSchema.methods.calculateScore = async function() {
  let totalScore = 0;
  
  for (const answer of this.answers) {
    totalScore += answer.marksAwarded;
  }
  
  this.score = Math.max(0, totalScore); // Ensure score is not negative
  return this.score;
};

// Instance method to check if attempt is expired
attemptSchema.methods.isExpired = function() {
  if (this.status !== 'in-progress') return false;
  
  const elapsed = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  const allowed = this.timeAllowed * 60;
  return elapsed >= allowed;
};

// Instance method to get time remaining
attemptSchema.methods.getTimeRemaining = function() {
  if (this.status !== 'in-progress') return 0;
  
  const elapsed = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  const allowed = this.timeAllowed * 60;
  return Math.max(0, allowed - elapsed);
};

// Instance method to submit attempt
attemptSchema.methods.submit = async function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.submissionTime = new Date();
  
  await this.calculateScore();
  
  // Check if passed (assuming passing marks are stored in quiz)
  const Quiz = mongoose.model('Quiz');
  const quiz = await Quiz.findById(this.quizId);
  if (quiz && quiz.passingMarks) {
    this.isPassed = this.score >= quiz.passingMarks;
  }
  
  return await this.save();
};

// Static method to get leaderboard
attemptSchema.statics.getLeaderboard = function(quizId, limit = 10) {
  return this.find({ 
    quizId, 
    status: 'completed' 
  })
  .populate('userId', 'firstName lastName username')
  .sort({ score: -1, submissionTime: 1 })
  .limit(limit);
};

// Static method to get user's best attempt
attemptSchema.statics.getUserBestAttempt = function(userId, quizId) {
  return this.findOne({ 
    userId, 
    quizId, 
    status: 'completed' 
  })
  .sort({ score: -1, submissionTime: 1 });
};

// Static method to get user's attempt history
attemptSchema.statics.getUserHistory = function(userId, limit = 20) {
  return this.find({ userId, status: 'completed' })
    .populate('quizId', 'title category difficulty totalMarks')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get quiz analytics
attemptSchema.statics.getQuizAnalytics = async function(quizId) {
  const attempts = await this.find({ quizId, status: 'completed' });
  
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      averageTime: 0
    };
  }

  const scores = attempts.map(attempt => attempt.score);
  const times = attempts.map(attempt => attempt.timeSpent);
  const passed = attempts.filter(attempt => attempt.isPassed).length;

  return {
    totalAttempts: attempts.length,
    averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / attempts.length) * 100) / 100,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passRate: Math.round((passed / attempts.length) * 100),
    averageTime: Math.round(times.reduce((sum, time) => sum + time, 0) / attempts.length)
  };
};

module.exports = mongoose.model('Attempt', attemptSchema);
