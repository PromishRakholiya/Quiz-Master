// Middleware to check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      error: 'ADMIN_REQUIRED'
    });
  }

  next();
};

// Middleware to check if user is student
const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Student access required',
      error: 'STUDENT_REQUIRED'
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserIdField] || 
                          req.params[resourceUserIdField] || 
                          req.query[resourceUserIdField];

    if (!resourceUserId || resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied - you can only access your own resources',
        error: 'OWNERSHIP_REQUIRED'
      });
    }

    next();
  };
};

// Middleware to check if user can access quiz (for quiz attempts)
const requireQuizAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    const Quiz = require('../models/Quiz');
    const quizId = req.params.quizId || req.body.quizId;

    if (!quizId) {
      return res.status(400).json({ 
        message: 'Quiz ID is required',
        error: 'MISSING_QUIZ_ID'
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ 
        message: 'Quiz not found',
        error: 'QUIZ_NOT_FOUND'
      });
    }

    // Admin can access any quiz
    if (req.user.role === 'admin') {
      req.quiz = quiz;
      return next();
    }

    // Students can only access published and available quizzes
    if (req.user.role === 'student') {
      if (!quiz.isAvailable()) {
        return res.status(403).json({ 
          message: 'Quiz is not available',
          error: 'QUIZ_NOT_AVAILABLE'
        });
      }

      // Check if user has attempts left
      const canAttempt = await quiz.canUserAttempt(req.user._id);
      if (!canAttempt && req.method === 'POST') {
        return res.status(403).json({ 
          message: 'Maximum attempts reached',
          error: 'MAX_ATTEMPTS_REACHED'
        });
      }
    }

    req.quiz = quiz;
    next();
  } catch (error) {
    console.error('Quiz access check error:', error);
    return res.status(500).json({ 
      message: 'Error checking quiz access',
      error: 'QUIZ_ACCESS_ERROR'
    });
  }
};

// Middleware to check if user can manage quiz (create, edit, delete)
const requireQuizManagement = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Only admins can manage quizzes
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required for quiz management',
        error: 'ADMIN_REQUIRED'
      });
    }

    // For update/delete operations, check if quiz exists and user has access
    if (req.params.quizId) {
      const Quiz = require('../models/Quiz');
      const quiz = await Quiz.findById(req.params.quizId);

      if (!quiz) {
        return res.status(404).json({ 
          message: 'Quiz not found',
          error: 'QUIZ_NOT_FOUND'
        });
      }

      req.quiz = quiz;
    }

    next();
  } catch (error) {
    console.error('Quiz management check error:', error);
    return res.status(500).json({ 
      message: 'Error checking quiz management access',
      error: 'QUIZ_MANAGEMENT_ERROR'
    });
  }
};

// Middleware to log access attempts
const logAccess = (action) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userId = req.user ? req.user._id : 'anonymous';
    const userRole = req.user ? req.user.role : 'none';
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${action} - User: ${userId} (${userRole}) - IP: ${ip} - ${req.method} ${req.originalUrl}`);
    
    next();
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireStudent,
  requireOwnershipOrAdmin,
  requireQuizAccess,
  requireQuizManagement,
  logAccess
};
