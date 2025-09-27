import React from 'react'

export default function Timer({ minutes = 0, seconds = 0, totalMinutes = 30 }) {
  const [pulse, setPulse] = React.useState(false)
  
  const totalSeconds = minutes * 60 + seconds
  const totalTime = totalMinutes * 60
  const percentage = totalTime > 0 ? (totalSeconds / totalTime) * 100 : 0
  
  // Trigger pulse animation for critical time
  React.useEffect(() => {
    if (minutes === 0 && seconds <= 30 && seconds > 0) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 500)
      return () => clearTimeout(timer)
    }
  }, [minutes, seconds])
  
  // Color coding based on time remaining
  const getTimerStyle = () => {
    if (minutes === 0 && seconds <= 30) {
      return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-300 animate-pulse'
    } else if (minutes <= 2) {
      return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-300'
    } else if (percentage <= 25) {
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-300'
    } else {
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-300'
    }
  }

  const getIcon = () => {
    if (minutes === 0 && seconds <= 30) return '🚨'
    if (minutes <= 2) return '⚠️'
    if (percentage <= 25) return '⏳'
    return '⏰'
  }

  const getStatusMessage = () => {
    if (minutes === 0 && seconds === 0) return 'Time expired!'
    if (minutes === 0 && seconds <= 30) return 'Critical time!'
    if (minutes <= 2) return 'Hurry up!'
    if (percentage <= 25) return 'Quarter time left'
    return 'Time remaining'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main Timer Display */}
      <div className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xl shadow-lg transition-all duration-300 ${getTimerStyle()} ${pulse ? 'scale-110' : ''}`}>
        <span className="text-2xl animate-bounce">{getIcon()}</span>
        <div className="flex items-center gap-1">
          <span className="tabular-nums">{String(minutes).padStart(2,'0')}</span>
          <span className="animate-pulse">:</span>
          <span className="tabular-nums">{String(seconds).padStart(2,'0')}</span>
        </div>
        
        {/* Glow effect for critical time */}
        {minutes === 0 && seconds <= 30 && (
          <div className="absolute inset-0 rounded-2xl bg-red-500 opacity-30 animate-ping" />
        )}
      </div>
      
      {/* Progress Ring */}
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            className={`transition-all duration-1000 ease-out ${
              percentage <= 10 ? 'text-red-500' : 
              percentage <= 25 ? 'text-yellow-500' : 
              'text-green-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {/* Status Message */}
      <div className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
        minutes === 0 && seconds <= 30 ? 'bg-red-100 text-red-700 animate-pulse' :
        minutes <= 2 ? 'bg-orange-100 text-orange-700' :
        percentage <= 25 ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>
        {getStatusMessage()}
      </div>

      {/* Time Warnings */}
      {minutes <= 5 && minutes > 0 && (
        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
          <span>⚡</span>
          <span>Less than {minutes} minute{minutes !== 1 ? 's' : ''} left</span>
        </div>
      )}
    </div>
  )
}