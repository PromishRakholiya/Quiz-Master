import React from 'react'
import { Link } from 'react-router-dom'

export default function QuizCard({ quiz }) {
  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{quiz.difficulty || 'Medium'}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 line-clamp-2">{quiz.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span>📝</span>
          <span>{quiz.questionCount || quiz.totalQuestions || 0} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⏱️</span>
          <span>{quiz.duration} minutes</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📊</span>
          <span>{quiz.totalMarks || 0} marks</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📂</span>
          <span>{quiz.category || 'General'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          {quiz.canAttempt !== false && (
            <Link to={`/attempt/${quiz._id}`} className="btn btn-primary text-sm">
              🚀 Start Quiz
            </Link>
          )}
          <Link to={`/leaderboard/${quiz._id}`} className="btn btn-secondary text-sm">
            🏆 Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
