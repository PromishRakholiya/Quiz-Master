import React from 'react'

export default function Question({ q, onAnswer, index }) {
  const [value, setValue] = React.useState(q.questionType === 'multiple-choice' ? [] : null)
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleToggleCheckbox = (optionId) => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 200)
    
    setValue(prev => {
      let next
      if (Array.isArray(prev)) {
        next = prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      } else {
        next = [optionId]
      }
      onAnswer?.(q._id, next)
      return next
    })
  }

  const handleSelectRadio = (optionId) => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 200)
    
    setValue(optionId)
    onAnswer?.(q._id, optionId)
  }

  const handleText = (text) => {
    setValue(text)
    onAnswer?.(q._id, text)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple-choice': return '☑️'
      case 'true-false': return '✅'
      case 'fill-in-blank': return '✏️'
      default: return '❓'
    }
  }

  return (
    <div className={`card p-6 transition-all duration-500 ${isAnimating ? 'scale-[1.02] shadow-xl' : ''}`}>
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {typeof index === 'number' && (
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              {index + 1}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl">{getQuestionTypeIcon(q.questionType)}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {q.questionType?.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {q.difficulty && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(q.difficulty)}`}>
              {q.difficulty}
            </span>
          )}
          {q.marks && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              {q.marks} pts
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
          {q.questionText}
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {q.questionType === 'fill-in-blank' ? (
          <div className="relative">
            <textarea 
              className="input min-h-[100px] resize-none"
              placeholder="Type your answer here..."
              value={value || ''}
              onChange={(e) => handleText(e.target.value)}
              rows={3}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {(value || '').length} characters
            </div>
          </div>
        ) : q.questionType === 'multiple-choice' ? (
          <div className="space-y-3">
            {q.options?.map((opt, idx) => {
              const isSelected = Array.isArray(value) ? value.includes(opt._id) : false
              const optionLetter = String.fromCharCode(65 + idx) // A, B, C, D...
              
              return (
                <label 
                  key={opt._id} 
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md group ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCheckbox(opt._id)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      {optionLetter}
                    </span>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isSelected ? 'text-blue-900' : 'text-gray-700 group-hover:text-blue-800'
                    }`}>
                      {opt.text}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        ) : (
          // True/False questions
          <div className="grid grid-cols-2 gap-4">
            {q.options?.map((opt, idx) => {
              const isSelected = value === opt._id
              const isTrue = opt.text.toLowerCase().includes('true')
              
              return (
                <label 
                  key={opt._id} 
                  className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md group ${
                    isSelected 
                      ? isTrue 
                        ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]' 
                        : 'border-red-500 bg-red-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={q._id} 
                    value={opt._id} 
                    checked={isSelected}
                    onChange={() => handleSelectRadio(opt._id)}
                    className="sr-only"
                  />
                  
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isSelected 
                      ? isTrue 
                        ? 'border-green-500 bg-green-500 text-white' 
                        : 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {isTrue ? '✅' : '❌'}
                    </div>
                    <span className={`text-lg font-bold transition-colors duration-300 ${
                      isSelected 
                        ? isTrue ? 'text-green-700' : 'text-red-700'
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {opt.text}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Answer Status */}
      {((q.questionType === 'multiple-choice' && Array.isArray(value) && value.length > 0) ||
        (q.questionType !== 'multiple-choice' && value)) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <span className="text-green-500 text-lg animate-bounce">✅</span>
          <span className="text-sm font-medium text-green-700">Answer recorded</span>
        </div>
      )}
    </div>
  )
}