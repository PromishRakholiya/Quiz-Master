const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

/**
 * List questions for a quiz (Admin only or for preview)
 */
const listQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found', error: 'QUIZ_NOT_FOUND' });
    }

    const questions = await Question.find({ quizId, isActive: true }).sort({ orderIndex: 1, createdAt: 1 });

    res.json({ questions });
  } catch (error) {
    console.error('List questions error:', error);
    res.status(500).json({ message: 'Failed to list questions', error: 'LIST_QUESTIONS_ERROR' });
  }
};

/**
 * Create a new question (Admin only)
 */
const createQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found', error: 'QUIZ_NOT_FOUND' });
    }

    const question = new Question({ ...req.body, quizId });
    await question.save();

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Failed to create question', error: 'CREATE_QUESTION_ERROR' });
  }
};

/**
 * Update a question (Admin only)
 */
const updateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { questionId } = req.params;

    const question = await Question.findByIdAndUpdate(
      questionId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found', error: 'QUESTION_NOT_FOUND' });
    }

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Failed to update question', error: 'UPDATE_QUESTION_ERROR' });
  }
};

/**
 * Delete a question (soft delete)
 */
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found', error: 'QUESTION_NOT_FOUND' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Failed to delete question', error: 'DELETE_QUESTION_ERROR' });
  }
};

/**
 * Reorder questions in a quiz
 */
const reorderQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { order } = req.body; // array of { questionId, orderIndex }

    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'Order must be an array', error: 'INVALID_ORDER' });
    }

    const bulkOps = order.map(({ questionId, orderIndex }) => ({
      updateOne: {
        filter: { _id: questionId, quizId },
        update: { $set: { orderIndex } }
      }
    }));

    if (bulkOps.length > 0) {
      await Question.bulkWrite(bulkOps);
    }

    res.json({ message: 'Questions reordered successfully' });
  } catch (error) {
    console.error('Reorder questions error:', error);
    res.status(500).json({ message: 'Failed to reorder questions', error: 'REORDER_QUESTIONS_ERROR' });
  }
};

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions
};
