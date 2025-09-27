const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireQuizAccess, logAccess } = require('../middlewares/roleMiddleware');
const attemptController = require('../controllers/attemptController');

const router = express.Router();

// POST /api/attempts/start/:quizId - start an attempt
router.post(
  '/start/:quizId',
  authenticateToken,
  param('quizId').isMongoId().withMessage('Valid quizId is required'),
  requireQuizAccess,
  logAccess('Start attempt'),
  attemptController.startAttempt
);

// POST /api/attempts/submit/:attemptId - submit an attempt
router.post(
  '/submit/:attemptId',
  authenticateToken,
  param('attemptId').isMongoId().withMessage('Valid attemptId is required'),
  body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
  logAccess('Submit attempt'),
  attemptController.submitAttempt
);

// GET /api/attempts/leaderboard/:quizId - leaderboard for a quiz
router.get(
  '/leaderboard/:quizId',
  authenticateToken,
  param('quizId').isMongoId().withMessage('Valid quizId is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  logAccess('Get leaderboard'),
  attemptController.getLeaderboard
);

// GET /api/attempts/me/history - current user's history
router.get(
  '/me/history',
  authenticateToken,
  logAccess('Get my history'),
  attemptController.getMyHistory
);

// GET /api/attempts/:attemptId - get a specific attempt (owner/admin)
router.get(
  '/:attemptId',
  authenticateToken,
  param('attemptId').isMongoId().withMessage('Valid attemptId is required'),
  logAccess('Get attempt by id'),
  attemptController.getAttemptById
);

module.exports = router;
