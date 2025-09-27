const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    maxlength: [500, 'Option text cannot exceed 500 characters']
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question text cannot exceed 1000 characters']
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-in-blank'],
    default: 'multiple-choice'
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(options) {
        if (this.questionType === 'multiple-choice') {
          return options.length >= 2 && options.length <= 6;
        } else if (this.questionType === 'true-false') {
          return options.length === 2;
        }
        return true; // For fill-in-blank, options are not required
      },
      message: 'Invalid number of options for the question type'
    }
  },
  correctAnswer: {
    type: String,
    required: function() {
      return this.questionType === 'fill-in-blank';
    },
    trim: true
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0.5, 'Marks must be at least 0.5'],
    max: [100, 'Marks cannot exceed 100']
  },
  negativeMarks: {
    type: Number,
    default: 0,
    min: [0, 'Negative marks cannot be less than 0']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
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
  orderIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ quizId: 1, orderIndex: 1 });
questionSchema.index({ quizId: 1, isActive: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ questionType: 1 });

// Pre-save validation
questionSchema.pre('save', function(next) {
  // Ensure at least one correct answer for multiple-choice and true-false
  if (this.questionType === 'multiple-choice' || this.questionType === 'true-false') {
    const hasCorrectAnswer = this.options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      return next(new Error('At least one option must be marked as correct'));
    }
  }

  // For true-false questions, ensure exactly 2 options
  if (this.questionType === 'true-false' && this.options.length !== 2) {
    return next(new Error('True-false questions must have exactly 2 options'));
  }

  // For multiple-choice, ensure only appropriate number of correct answers
  if (this.questionType === 'multiple-choice') {
    const correctCount = this.options.filter(option => option.isCorrect).length;
    if (correctCount === 0) {
      return next(new Error('Multiple-choice questions must have at least one correct answer'));
    }
  }

  next();
});

// Instance method to get correct answer(s)
questionSchema.methods.getCorrectAnswers = function() {
  if (this.questionType === 'fill-in-blank') {
    return [this.correctAnswer];
  }
  return this.options.filter(option => option.isCorrect).map(option => option._id);
};

// Instance method to check if answer is correct
questionSchema.methods.isAnswerCorrect = function(userAnswer) {
  if (this.questionType === 'fill-in-blank') {
    return this.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
  }
  
  const correctOptions = this.options.filter(option => option.isCorrect);
  
  if (Array.isArray(userAnswer)) {
    // Multiple correct answers
    return correctOptions.length === userAnswer.length &&
           correctOptions.every(option => userAnswer.includes(option._id.toString()));
  } else {
    // Single correct answer
    return correctOptions.some(option => option._id.toString() === userAnswer);
  }
};

// Instance method to calculate score
questionSchema.methods.calculateScore = function(userAnswer, timeSpent = 0) {
  const isCorrect = this.isAnswerCorrect(userAnswer);
  
  if (isCorrect) {
    return this.marks;
  } else {
    return -this.negativeMarks;
  }
};

// Static method to get questions for quiz
questionSchema.statics.getQuizQuestions = function(quizId, randomize = false) {
  const query = this.find({ quizId, isActive: true });
  
  if (randomize) {
    return query.aggregate([
      { $match: { quizId: mongoose.Types.ObjectId(quizId), isActive: true } },
      { $sample: { size: 1000 } } // Get all questions in random order
    ]);
  }
  
  return query.sort({ orderIndex: 1, createdAt: 1 });
};

// Static method to update question statistics
questionSchema.statics.updateStatistics = async function(questionId, isCorrect, timeSpent) {
  const question = await this.findById(questionId);
  if (!question) return;

  const newTotalAttempts = question.statistics.totalAttempts + 1;
  const newCorrectAttempts = question.statistics.correctAttempts + (isCorrect ? 1 : 0);
  const newAverageTime = ((question.statistics.averageTime * question.statistics.totalAttempts) + timeSpent) / newTotalAttempts;

  await this.findByIdAndUpdate(questionId, {
    'statistics.totalAttempts': newTotalAttempts,
    'statistics.correctAttempts': newCorrectAttempts,
    'statistics.averageTime': Math.round(newAverageTime)
  });
};

// Virtual for success rate
questionSchema.virtual('successRate').get(function() {
  if (this.statistics.totalAttempts === 0) return 0;
  return Math.round((this.statistics.correctAttempts / this.statistics.totalAttempts) * 100);
});

module.exports = mongoose.model('Question', questionSchema);
