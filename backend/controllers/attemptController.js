const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { calculateScore, validateAnswers, generatePerformanceFeedback } = require('../utils/scoreCalculator');

/**
 * Start a quiz attempt
 */
const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Validate quiz access has already been done by middleware
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found', error: 'QUIZ_NOT_FOUND' });
    }

    // Determine next attempt number
    const lastAttempt = await Attempt.findOne({ userId: req.user._id, quizId })
      .sort({ attemptNumber: -1 });
    const nextAttemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Create attempt
    const attempt = new Attempt({
      userId: req.user._id,
      quizId: quiz._id,
      attemptNumber: nextAttemptNumber,
      timeAllowed: quiz.duration,
      totalMarks: quiz.totalMarks,
      status: 'in-progress',
      startTime: new Date(),
      answers: []
    });

    await attempt.save();

    // Fetch active questions
    let questionsQuery = Question.find({ quizId: quiz._id, isActive: true })
      .select('-explanation -statistics -__v')
      .sort({ orderIndex: 1, createdAt: 1 });

    let questions = await questionsQuery;

    // Randomize questions/options if needed
    if (quiz.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    if (quiz.randomizeOptions) {
      questions = questions.map(q => ({
        ...q.toObject(),
        options: q.options.sort(() => Math.random() - 0.5)
      }));
    } else {
      questions = questions.map(q => q.toObject());
    }

    // Hide correct answers/options correctness flags for students
    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      quizId: q.quizId,
      questionText: q.questionText,
      questionType: q.questionType,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficulty: q.difficulty,
      orderIndex: q.orderIndex,
      options: q.options?.map(o => ({ _id: o._id, text: o.text })) || [],
    }));

    res.status(201).json({
      message: 'Attempt started',
      attemptId: attempt._id,
      timeAllowed: attempt.timeAllowed,
      startTime: attempt.startTime,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Start attempt error:', error);
    res.status(500).json({ message: 'Failed to start attempt', error: 'START_ATTEMPT_ERROR' });
  }
};

/**
 * Submit a quiz attempt
 */
const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    // Validate answers format
    const validation = validateAnswers(answers);
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Invalid answers format', errors: validation.errors });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found', error: 'ATTEMPT_NOT_FOUND' });
    }

    // Ownership check
    if (attempt.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied', error: 'FORBIDDEN' });
    }

    // Prevent resubmission
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ message: 'Attempt already submitted or closed', error: 'ALREADY_SUBMITTED' });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found', error: 'QUIZ_NOT_FOUND' });
    }

    // Time check - auto mark expired
    if (attempt.isExpired()) {
      attempt.status = 'time-expired';
    }

    // Load all needed questions
    const questionIds = answers.map(a => new mongoose.Types.ObjectId(a.questionId));
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Map answers to Attempt.answers with correctness and marks
    const scoreResult = await calculateScore(answers, questions);

    attempt.answers = scoreResult.detailedResults.map(r => ({
      questionId: r.questionId,
      userAnswer: r.userAnswer,
      isCorrect: r.isCorrect,
      marksAwarded: Math.max(0, r.marksAwarded),
      timeSpent: r.timeSpent || 0
    }));

    attempt.totalMarks = scoreResult.totalMarks;
    attempt.score = scoreResult.totalScore;
    attempt.percentage = scoreResult.percentage;
    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.submissionTime = new Date();

    // Pass/fail
    attempt.isPassed = quiz.passingMarks ? attempt.score >= quiz.passingMarks : true;

    await attempt.save();

    // Optionally include correct answers
    let resultsToSend = scoreResult.detailedResults;
    if (!quiz.showCorrectAnswers) {
      resultsToSend = scoreResult.detailedResults.map(r => ({
        questionId: r.questionId,
        isCorrect: r.isCorrect,
        marksAwarded: r.marksAwarded,
        maxMarks: r.maxMarks,
        timeSpent: r.timeSpent
      }));
    }

    const feedback = generatePerformanceFeedback(scoreResult, quiz);

    res.json({
      message: 'Attempt submitted successfully',
      result: {
        attemptId: attempt._id,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        status: attempt.status,
        results: resultsToSend,
        feedback
      }
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ message: 'Failed to submit attempt', error: 'SUBMIT_ATTEMPT_ERROR' });
  }
};

/**
 * Get leaderboard for a quiz
 */
const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const leaderboard = await Attempt.getLeaderboard(quizId, parseInt(req.query.limit || '10'));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard', error: 'LEADERBOARD_ERROR' });
  }
};

/**
 * Get current user's attempt history
 */
const getMyHistory = async (req, res) => {
  try {
    const history = await Attempt.getUserHistory(req.user._id, parseInt(req.query.limit || '20'));
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to get history', error: 'HISTORY_ERROR' });
  }
};

/**
 * Get a specific attempt (owner or admin)
 */
const getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await Attempt.findById(attemptId)
      .populate('quizId', 'title showCorrectAnswers')
      .populate('userId', 'firstName lastName username');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found', error: 'ATTEMPT_NOT_FOUND' });
    }

    if (req.user.role !== 'admin' && attempt.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied', error: 'FORBIDDEN' });
    }

    res.json({ attempt });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ message: 'Failed to get attempt', error: 'GET_ATTEMPT_ERROR' });
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getLeaderboard,
  getMyHistory,
  getAttemptById
};
