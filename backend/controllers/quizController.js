const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { calculateQuizStatistics } = require('../utils/scoreCalculator');

/**
 * Get all quizzes (with filtering and pagination)
 */
const getAllQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      isPublished,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    // Role-based filtering
    if (req.user.role === 'student') {
      // Show all published quizzes, regardless of start/end dates
      filter.isPublished = true;
    } else if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'firstName lastName username')
      .populate('questionCount')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalQuizzes = await Quiz.countDocuments(filter);
    const totalPages = Math.ceil(totalQuizzes / parseInt(limit));

    // Add additional info for each quiz
    const quizzesWithInfo = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizObj = quiz.toObject();
        
        // Get question count
        quizObj.questionCount = await Question.countDocuments({ 
          quizId: quiz._id, 
          isActive: true 
        });

        // For students, check if they can attempt this quiz
        if (req.user.role === 'student') {
          quizObj.canAttempt = await quiz.canUserAttempt(req.user._id);
          
          // Get user's best attempt
          const bestAttempt = await Attempt.getUserBestAttempt(req.user._id, quiz._id);
          if (bestAttempt) {
            quizObj.userBestScore = bestAttempt.score;
            quizObj.userBestPercentage = bestAttempt.percentage;
          }
        }

        return quizObj;
      })
    );

    res.json({
      quizzes: quizzesWithInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalQuizzes,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all quizzes error:', error);
    res.status(500).json({
      message: 'Failed to fetch quizzes',
      error: 'FETCH_QUIZZES_ERROR'
    });
  }
};

/**
 * Get quiz by ID
 */
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { includeQuestions = false } = req.query;

    const quiz = await Quiz.findById(quizId)
      .populate('createdBy', 'firstName lastName username');

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    // Check permissions
    if (req.user.role === 'student' && !quiz.isAvailable()) {
      return res.status(403).json({
        message: 'Quiz is not available',
        error: 'QUIZ_NOT_AVAILABLE'
      });
    }

    const quizObj = quiz.toObject();

    // Get question count
    quizObj.questionCount = await Question.countDocuments({ 
      quizId: quiz._id, 
      isActive: true 
    });

    // Include questions if requested (for admin or quiz preview)
    if (includeQuestions === 'true' && req.user.role === 'admin') {
      quizObj.questions = await Question.find({ 
        quizId: quiz._id, 
        isActive: true 
      }).sort({ orderIndex: 1, createdAt: 1 });
    }

    // For students, add attempt information
    if (req.user.role === 'student') {
      quizObj.canAttempt = await quiz.canUserAttempt(req.user._id);
      
      // Get user's attempts
      const userAttempts = await Attempt.find({ 
        userId: req.user._id, 
        quizId: quiz._id,
        status: 'completed'
      }).sort({ score: -1, createdAt: -1 });

      quizObj.userAttempts = userAttempts.length;
      quizObj.userBestAttempt = userAttempts[0] || null;
    }

    // For admin, add statistics
    if (req.user.role === 'admin') {
      const attempts = await Attempt.find({ quizId: quiz._id, status: 'completed' });
      quizObj.statistics = calculateQuizStatistics(attempts);
    }

    res.json({ quiz: quizObj });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({
      message: 'Failed to fetch quiz',
      error: 'FETCH_QUIZ_ERROR'
    });
  }
};

/**
 * Create new quiz (Admin only)
 */
const createQuiz = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const quizData = {
      ...req.body,
      createdBy: req.user._id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    // Populate creator info
    await quiz.populate('createdBy', 'firstName lastName username');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      message: 'Failed to create quiz',
      error: 'CREATE_QUIZ_ERROR'
    });
  }
};

/**
 * Update quiz (Admin only)
 */
const updateQuiz = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quizId } = req.params;
    const updateData = req.body;

    // Don't allow updating createdBy
    delete updateData.createdBy;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName username');

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    res.json({
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      message: 'Failed to update quiz',
      error: 'UPDATE_QUIZ_ERROR'
    });
  }
};

/**
 * Delete quiz (Admin only)
 */
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Soft delete - set isActive to false
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { isActive: false },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    // Also deactivate associated questions
    await Question.updateMany(
      { quizId },
      { isActive: false }
    );

    res.json({
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      message: 'Failed to delete quiz',
      error: 'DELETE_QUIZ_ERROR'
    });
  }
};

/**
 * Publish/Unpublish quiz (Admin only)
 */
const toggleQuizPublication = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    // Check if quiz has questions before publishing
    if (!quiz.isPublished) {
      const questionCount = await Question.countDocuments({ 
        quizId, 
        isActive: true 
      });
      
      if (questionCount === 0) {
        return res.status(400).json({
          message: 'Cannot publish quiz without questions',
          error: 'NO_QUESTIONS'
        });
      }
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json({
      message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        isPublished: quiz.isPublished
      }
    });
  } catch (error) {
    console.error('Toggle quiz publication error:', error);
    res.status(500).json({
      message: 'Failed to toggle quiz publication',
      error: 'TOGGLE_PUBLICATION_ERROR'
    });
  }
};

/**
 * Get quiz statistics (Admin only)
 */
const getQuizStatistics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    // Get all completed attempts
    const attempts = await Attempt.find({ 
      quizId, 
      status: 'completed' 
    }).populate('userId', 'firstName lastName username');

    // Calculate statistics
    const statistics = calculateQuizStatistics(attempts);

    // Get question-wise statistics
    const questions = await Question.find({ quizId, isActive: true });
    const questionStats = questions.map(question => ({
      questionId: question._id,
      questionText: question.questionText.substring(0, 100) + '...',
      totalAttempts: question.statistics.totalAttempts,
      correctAttempts: question.statistics.correctAttempts,
      successRate: question.successRate,
      averageTime: question.statistics.averageTime
    }));

    // Get recent attempts
    const recentAttempts = attempts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(attempt => ({
        userId: attempt.userId._id,
        userName: `${attempt.userId.firstName} ${attempt.userId.lastName}`,
        score: attempt.score,
        percentage: attempt.percentage,
        timeSpent: attempt.timeSpent,
        createdAt: attempt.createdAt
      }));

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalMarks: quiz.totalMarks
      },
      statistics,
      questionStats,
      recentAttempts
    });
  } catch (error) {
    console.error('Get quiz statistics error:', error);
    res.status(500).json({
      message: 'Failed to fetch quiz statistics',
      error: 'FETCH_STATISTICS_ERROR'
    });
  }
};

/**
 * Duplicate quiz (Admin only)
 */
const duplicateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title } = req.body;

    const originalQuiz = await Quiz.findById(quizId);

    if (!originalQuiz) {
      return res.status(404).json({
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    // Create new quiz
    const quizData = originalQuiz.toObject();
    delete quizData._id;
    delete quizData.createdAt;
    delete quizData.updatedAt;
    delete quizData.statistics;
    
    quizData.title = title || `${originalQuiz.title} (Copy)`;
    quizData.isPublished = false;
    quizData.createdBy = req.user._id;

    const newQuiz = new Quiz(quizData);
    await newQuiz.save();

    // Duplicate questions
    const originalQuestions = await Question.find({ 
      quizId: originalQuiz._id, 
      isActive: true 
    });

    const questionPromises = originalQuestions.map(async (question) => {
      const questionData = question.toObject();
      delete questionData._id;
      delete questionData.createdAt;
      delete questionData.updatedAt;
      delete questionData.statistics;
      
      questionData.quizId = newQuiz._id;
      
      const newQuestion = new Question(questionData);
      return newQuestion.save();
    });

    await Promise.all(questionPromises);

    // Populate creator info
    await newQuiz.populate('createdBy', 'firstName lastName username');

    res.status(201).json({
      message: 'Quiz duplicated successfully',
      quiz: newQuiz
    });
  } catch (error) {
    console.error('Duplicate quiz error:', error);
    res.status(500).json({
      message: 'Failed to duplicate quiz',
      error: 'DUPLICATE_QUIZ_ERROR'
    });
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizPublication,
  getQuizStatistics,
  duplicateQuiz
};
