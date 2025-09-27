const express = require('express');
const { body, query } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin, logAccess } = require('../middlewares/roleMiddleware');
const quizController = require('../controllers/quizController');

const router = express.Router();

// GET /api/quizzes
router.get(
  '/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString(),
    query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
    query('isPublished').optional().isBoolean().toBoolean(),
    query('search').optional().isString(),
    query('sortBy').optional().isIn(['createdAt', 'title', 'statistics.averageScore']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  logAccess('List quizzes'),
  quizController.getAllQuizzes
);

// GET /api/quizzes/:quizId
router.get(
  '/:quizId',
  authenticateToken,
  quizController.getQuizById
);

// POST /api/quizzes (admin)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('title').isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 chars'),
    body('description').isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 chars'),
    body('duration').isInt({ min: 1, max: 300 }).withMessage('Duration 1-300 minutes'),
    body('passingMarks').optional().isFloat({ min: 0 }),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('randomizeQuestions').optional().isBoolean(),
    body('randomizeOptions').optional().isBoolean(),
    body('showResultsImmediately').optional().isBoolean(),
    body('showCorrectAnswers').optional().isBoolean(),
    body('allowReview').optional().isBoolean(),
    body('category').optional().isIn(['General', 'Mathematics', 'Science', 'History', 'Geography', 'Literature', 'Technology', 'Other']),
    body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard'])
  ],
  logAccess('Create quiz'),
  quizController.createQuiz
);

// PUT /api/quizzes/:quizId (admin)
router.put(
  '/:quizId',
  authenticateToken,
  requireAdmin,
  [
    body('title').optional().isLength({ min: 3, max: 200 }),
    body('description').optional().isLength({ min: 10, max: 1000 }),
    body('duration').optional().isInt({ min: 1, max: 300 }),
    body('passingMarks').optional().isFloat({ min: 0 }),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('randomizeQuestions').optional().isBoolean(),
    body('randomizeOptions').optional().isBoolean(),
    body('showResultsImmediately').optional().isBoolean(),
    body('showCorrectAnswers').optional().isBoolean(),
    body('allowReview').optional().isBoolean(),
    body('category').optional().isIn(['General', 'Mathematics', 'Science', 'History', 'Geography', 'Literature', 'Technology', 'Other']),
    body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard'])
  ],
  logAccess('Update quiz'),
  quizController.updateQuiz
);

// DELETE /api/quizzes/:quizId (admin)
router.delete(
  '/:quizId',
  authenticateToken,
  requireAdmin,
  logAccess('Delete quiz'),
  quizController.deleteQuiz
);

// PATCH /api/quizzes/:quizId/toggle (admin)
router.patch(
  '/:quizId/toggle',
  authenticateToken,
  requireAdmin,
  logAccess('Toggle quiz publication'),
  quizController.toggleQuizPublication
);

// GET /api/quizzes/:quizId/statistics (admin)
router.get(
  '/:quizId/statistics',
  authenticateToken,
  requireAdmin,
  logAccess('Get quiz statistics'),
  quizController.getQuizStatistics
);

// POST /api/quizzes/:quizId/duplicate (admin)
router.post(
  '/:quizId/duplicate',
  authenticateToken,
  requireAdmin,
  [body('title').optional().isLength({ min: 3, max: 200 })],
  logAccess('Duplicate quiz'),
  quizController.duplicateQuiz
);

module.exports = router;
