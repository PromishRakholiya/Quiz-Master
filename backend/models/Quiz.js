const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Quiz title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true,
    maxlength: [1000, 'Quiz description cannot exceed 1000 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Quiz duration is required'],
    min: [1, 'Quiz duration must be at least 1 minute'],
    max: [300, 'Quiz duration cannot exceed 300 minutes']
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  passingMarks: {
    type: Number,
    default: 0
  },
  instructions: {
    type: String,
    default: 'Read all questions carefully before answering. Once submitted, you cannot change your answers.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: [1, 'Maximum attempts must be at least 1']
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  showResultsImmediately: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  allowReview: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['General', 'Mathematics', 'Science', 'History', 'Geography', 'Literature', 'Technology', 'Other'],
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    lowestScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for questions
quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quizId'
});

// Virtual for attempts
quizSchema.virtual('attempts', {
  ref: 'Attempt',
  localField: '_id',
  foreignField: 'quizId'
});

// Virtual for question count
quizSchema.virtual('questionCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quizId',
  count: true
});

// Indexes for better performance
quizSchema.index({ createdBy: 1 });
quizSchema.index({ isActive: 1, isPublished: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ startDate: 1, endDate: 1 });
quizSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total marks
quizSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('questions')) {
    try {
      const Question = mongoose.model('Question');
      const questions = await Question.find({ quizId: this._id });
      this.totalMarks = questions.reduce((total, question) => total + question.marks, 0);
    } catch (error) {
      console.error('Error calculating total marks:', error);
    }
  }
  next();
});

// Instance method to check if quiz is available
quizSchema.methods.isAvailable = function() {
  const now = new Date();
  return this.isActive && 
         this.isPublished && 
         (!this.startDate || this.startDate <= now) && 
         (!this.endDate || this.endDate >= now);
};

// Instance method to check if user can attempt
quizSchema.methods.canUserAttempt = async function(userId) {
  const Attempt = mongoose.model('Attempt');
  const userAttempts = await Attempt.countDocuments({ 
    quizId: this._id, 
    userId: userId,
    status: 'completed'
  });
  return userAttempts < this.maxAttempts;
};

// Static method to find available quizzes
quizSchema.statics.findAvailable = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    isPublished: true,
    $or: [
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to update quiz statistics
quizSchema.statics.updateStatistics = async function(quizId) {
  const Attempt = mongoose.model('Attempt');
  const attempts = await Attempt.find({ quizId, status: 'completed' });
  
  if (attempts.length > 0) {
    const scores = attempts.map(attempt => attempt.score);
    const totalAttempts = attempts.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    await this.findByIdAndUpdate(quizId, {
      'statistics.totalAttempts': totalAttempts,
      'statistics.averageScore': Math.round(averageScore * 100) / 100,
      'statistics.highestScore': highestScore,
      'statistics.lowestScore': lowestScore
    });
  }
};

module.exports = mongoose.model('Quiz', quizSchema);
