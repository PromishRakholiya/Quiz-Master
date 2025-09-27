const Question = require('../models/Question');

/**
 * Calculate score for a quiz attempt
 * @param {Array} answers - Array of user answers with questionId and userAnswer
 * @param {Array} questions - Array of question objects
 * @returns {Object} Score calculation result
 */
const calculateScore = async (answers, questions) => {
  try {
    let totalScore = 0;
    let correctAnswers = 0;
    let totalQuestions = questions.length;
    const detailedResults = [];

    // Create a map for quick question lookup
    const questionMap = new Map();
    questions.forEach(question => {
      questionMap.set(question._id.toString(), question);
    });

    // Process each answer
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId.toString());
      
      if (!question) {
        console.warn(`Question not found for ID: ${answer.questionId}`);
        continue;
      }

      const isCorrect = question.isAnswerCorrect(answer.userAnswer);
      const marksAwarded = question.calculateScore(answer.userAnswer, answer.timeSpent || 0);
      
      if (isCorrect) {
        correctAnswers++;
      }

      totalScore += marksAwarded;

      detailedResults.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correctAnswer: question.getCorrectAnswers(),
        isCorrect,
        marksAwarded,
        maxMarks: question.marks,
        timeSpent: answer.timeSpent || 0
      });
    }

    // Ensure score is not negative
    totalScore = Math.max(0, totalScore);

    // Calculate percentage
    const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

    return {
      totalScore,
      totalMarks,
      percentage,
      correctAnswers,
      totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      detailedResults
    };
  } catch (error) {
    console.error('Error calculating score:', error);
    throw new Error('Score calculation failed');
  }
};

/**
 * Calculate partial score for ongoing attempt
 * @param {Array} answers - Array of answered questions
 * @param {Array} questions - Array of all questions in quiz
 * @returns {Object} Partial score result
 */
const calculatePartialScore = async (answers, questions) => {
  try {
    const answeredQuestions = answers.length;
    const totalQuestions = questions.length;
    
    if (answeredQuestions === 0) {
      return {
        currentScore: 0,
        answeredQuestions: 0,
        totalQuestions,
        progress: 0
      };
    }

    const scoreResult = await calculateScore(answers, questions.slice(0, answeredQuestions));
    
    return {
      currentScore: scoreResult.totalScore,
      answeredQuestions,
      totalQuestions,
      progress: Math.round((answeredQuestions / totalQuestions) * 100),
      accuracy: scoreResult.accuracy
    };
  } catch (error) {
    console.error('Error calculating partial score:', error);
    throw new Error('Partial score calculation failed');
  }
};

/**
 * Validate user answers format
 * @param {Array} answers - Array of user answers
 * @returns {Object} Validation result
 */
const validateAnswers = (answers) => {
  const errors = [];
  
  if (!Array.isArray(answers)) {
    errors.push('Answers must be an array');
    return { isValid: false, errors };
  }

  answers.forEach((answer, index) => {
    if (!answer.questionId) {
      errors.push(`Answer ${index + 1}: questionId is required`);
    }
    
    if (answer.userAnswer === undefined || answer.userAnswer === null) {
      errors.push(`Answer ${index + 1}: userAnswer is required`);
    }

    if (answer.timeSpent && (typeof answer.timeSpent !== 'number' || answer.timeSpent < 0)) {
      errors.push(`Answer ${index + 1}: timeSpent must be a non-negative number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate quiz statistics
 * @param {Array} attempts - Array of completed attempts
 * @returns {Object} Quiz statistics
 */
const calculateQuizStatistics = (attempts) => {
  if (!attempts || attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averageTime: 0,
      passRate: 0,
      scoreDistribution: {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      }
    };
  }

  const scores = attempts.map(attempt => attempt.percentage || 0);
  const times = attempts.map(attempt => attempt.timeSpent || 0);
  const passedAttempts = attempts.filter(attempt => attempt.isPassed).length;

  // Calculate score distribution
  const scoreDistribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };

  scores.forEach(score => {
    if (score <= 20) scoreDistribution['0-20']++;
    else if (score <= 40) scoreDistribution['21-40']++;
    else if (score <= 60) scoreDistribution['41-60']++;
    else if (score <= 80) scoreDistribution['61-80']++;
    else scoreDistribution['81-100']++;
  });

  return {
    totalAttempts: attempts.length,
    averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / attempts.length) * 100) / 100,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averageTime: Math.round(times.reduce((sum, time) => sum + time, 0) / attempts.length),
    passRate: Math.round((passedAttempts / attempts.length) * 100),
    scoreDistribution
  };
};

/**
 * Calculate question difficulty based on success rate
 * @param {Number} successRate - Success rate percentage
 * @returns {String} Difficulty level
 */
const calculateQuestionDifficulty = (successRate) => {
  if (successRate >= 80) return 'Easy';
  if (successRate >= 50) return 'Medium';
  return 'Hard';
};

/**
 * Generate performance feedback
 * @param {Object} scoreResult - Score calculation result
 * @param {Object} quiz - Quiz object
 * @returns {String} Performance feedback
 */
const generatePerformanceFeedback = (scoreResult, quiz) => {
  const { percentage, accuracy, correctAnswers, totalQuestions } = scoreResult;
  
  let feedback = '';
  
  if (percentage >= 90) {
    feedback = 'Excellent performance! You have mastered this topic.';
  } else if (percentage >= 80) {
    feedback = 'Great job! You have a strong understanding of the material.';
  } else if (percentage >= 70) {
    feedback = 'Good work! You have a solid grasp of most concepts.';
  } else if (percentage >= 60) {
    feedback = 'Fair performance. Consider reviewing the topics you missed.';
  } else {
    feedback = 'You may need to study this topic more thoroughly. Review the material and try again.';
  }

  feedback += ` You answered ${correctAnswers} out of ${totalQuestions} questions correctly (${accuracy}% accuracy).`;

  if (quiz.passingMarks && scoreResult.totalScore >= quiz.passingMarks) {
    feedback += ' Congratulations, you passed!';
  } else if (quiz.passingMarks) {
    feedback += ` You need ${quiz.passingMarks - scoreResult.totalScore} more points to pass.`;
  }

  return feedback;
};

module.exports = {
  calculateScore,
  calculatePartialScore,
  validateAnswers,
  calculateQuizStatistics,
  calculateQuestionDifficulty,
  generatePerformanceFeedback
};
