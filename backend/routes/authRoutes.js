const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Invalid role')
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  authController.refreshToken
);

// GET /api/auth/me
router.get('/me', authenticateToken, authController.getProfile);

// PUT /api/auth/me
router.put(
  '/me',
  authenticateToken,
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('firstName').optional().notEmpty().withMessage('First name is required'),
    body('lastName').optional().notEmpty().withMessage('Last name is required')
  ],
  authController.updateProfile
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  authController.changePassword
);

// POST /api/auth/logout
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
