const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireAdmin, logAccess } = require('../middlewares/roleMiddleware');
const questionController = require('../controllers/questionController');

const router = express.Router({ mergeParams: true });

// GET /api/questions/:quizId
router.get(
  '/:quizId',
  authenticateToken,
  requireAdmin,
  logAccess('List questions'),
  questionController.listQuestions
);

// POST /api/questions/:quizId (admin)
router.post(
  '/:quizId',
  authenticateToken,
  requireAdmin,
  [
    param('quizId').isMongoId().withMessage('Valid quizId is required'),
    body('questionText').isLength({ min: 3, max: 1000 }).withMessage('Question text must be 3-1000 chars'),
    body('questionType').optional().isIn(['multiple-choice', 'true-false', 'fill-in-blank']),
    body('marks').isFloat({ min: 0.5, max: 100 }).withMessage('Marks must be 0.5-100'),
    body('negativeMarks').optional().isFloat({ min: 0 }).withMessage('Negative marks cannot be negative'),
    body('options').optional().isArray().withMessage('Options must be an array'),
    body('correctAnswer').optional().isString(),
    body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard'])
  ],
  logAccess('Create question'),
  questionController.createQuestion
);

// PUT /api/questions/:questionId (admin)
router.put(
  '/:questionId',
  authenticateToken,
  requireAdmin,
  [
    param('questionId').isMongoId().withMessage('Valid questionId is required'),
    body('questionText').optional().isLength({ min: 3, max: 1000 }),
    body('questionType').optional().isIn(['multiple-choice', 'true-false', 'fill-in-blank']),
    body('marks').optional().isFloat({ min: 0.5, max: 100 }),
    body('negativeMarks').optional().isFloat({ min: 0 }),
    body('options').optional().isArray(),
    body('correctAnswer').optional().isString(),
    body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
    body('orderIndex').optional().isInt({ min: 0 })
  ],
  logAccess('Update question'),
  questionController.updateQuestion
);

// DELETE /api/questions/:questionId (admin)
router.delete(
  '/:questionId',
  authenticateToken,
  requireAdmin,
  [param('questionId').isMongoId().withMessage('Valid questionId is required')],
  logAccess('Delete question'),
  questionController.deleteQuestion
);

// PATCH /api/questions/:quizId/reorder (admin)
router.patch(
  '/:quizId/reorder',
  authenticateToken,
  requireAdmin,
  [
    param('quizId').isMongoId().withMessage('Valid quizId is required'),
    body('order').isArray().withMessage('Order must be an array')
  ],
  logAccess('Reorder questions'),
  questionController.reorderQuestions
);

module.exports = router;
