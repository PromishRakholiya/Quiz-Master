import React from 'react'
import { Link } from 'react-router-dom'

export default function QuizCard({ quiz }) {
  const [isHovered, setIsHovered] = React.useState(false)
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'General': '🎯',
      'Mathematics': '🔢',
      'Science': '🔬',
      'History': '📚',
      'Geography': '🌍',
      'Literature': '📖',
      'Technology': '💻',
      'Other': '📝'
    }
    return icons[category] || '📝'
  }

  return (
    <div 
      className="card-interactive p-6 group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
              {quiz.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">{getCategoryIcon(quiz.category)}</span>
              <span className="text-sm text-gray-600 font-medium">{quiz.category || 'General'}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${getDifficultyColor(quiz.difficulty)} ${isHovered ? 'scale-110' : ''}`}>
            {quiz.difficulty || 'Medium'}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50/80 rounded-xl p-3 transition-all duration-300 hover:bg-blue-100/80">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-lg">📝</span>
              <div>
                <div className="text-xs text-blue-600 font-medium">Questions</div>
                <div className="text-sm font-bold text-blue-700">{quiz.questionCount || quiz.totalQuestions || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50/80 rounded-xl p-3 transition-all duration-300 hover:bg-purple-100/80">
            <div className="flex items-center gap-2">
              <span className="text-purple-500 text-lg">⏱️</span>
              <div>
                <div className="text-xs text-purple-600 font-medium">Duration</div>
                <div className="text-sm font-bold text-purple-700">{quiz.duration} min</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50/80 rounded-xl p-3 transition-all duration-300 hover:bg-green-100/80">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">📊</span>
              <div>
                <div className="text-xs text-green-600 font-medium">Points</div>
                <div className="text-sm font-bold text-green-700">{quiz.totalMarks || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50/80 rounded-xl p-3 transition-all duration-300 hover:bg-orange-100/80">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-lg">🏆</span>
              <div>
                <div className="text-xs text-orange-600 font-medium">Attempts</div>
                <div className="text-sm font-bold text-orange-700">{quiz.maxAttempts || '∞'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Progress (if available) */}
        {quiz.userBestScore !== undefined && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800">Your Best Score</span>
              <span className="text-sm font-bold text-yellow-900">{quiz.userBestPercentage}%</span>
            </div>
            <div className="progress-bar mt-2">
              <div 
                className="progress-fill bg-gradient-to-r from-yellow-400 to-orange-500" 
                style={{ width: `${quiz.userBestPercentage || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {quiz.canAttempt !== false && (
            <Link 
              to={`/attempt/${quiz._id}`} 
              className="btn-primary flex-1 text-center group/btn relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-lg group-hover/btn:animate-bounce">🚀</span>
                <span>Start Quiz</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Link>
          )}
          
          <Link 
            to={`/leaderboard/${quiz._id}`} 
            className="btn-ghost px-4 group/btn relative overflow-hidden"
            title="View Leaderboard"
          >
            <span className="text-lg group-hover/btn:animate-pulse">🏆</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-orange-50 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>

        {/* Hover Effect Indicator */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`} />
      </div>
    </div>
  )
}