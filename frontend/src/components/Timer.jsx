import React from 'react'

export default function Timer({ minutes = 0, seconds = 0, totalMinutes = 30 }) {
  const totalSeconds = minutes * 60 + seconds
  const totalTime = totalMinutes * 60
  const percentage = totalTime > 0 ? (totalSeconds / totalTime) * 100 : 0
  
  // Color coding based on time remaining
  const getTimerStyle = () => {
    if (minutes === 0 && seconds <= 30) {
      return 'bg-red-500 text-white animate-pulse' // Critical - last 30 seconds
    } else if (minutes <= 2) {
      return 'bg-red-100 text-red-700 border border-red-300' // Warning - last 2 minutes
    } else if (percentage <= 25) {
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300' // Caution - 25% remaining
    } else {
      return 'bg-green-100 text-green-700 border border-green-300' // Safe
    }
  }

  const getIcon = () => {
    if (minutes === 0 && seconds <= 30) return '⏰'
    if (minutes <= 2) return '⚠️'
    if (percentage <= 25) return '⏳'
    return '🕐'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${getTimerStyle()}`}>
        <span>{getIcon()}</span>
        <span>{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            percentage <= 10 ? 'bg-red-500' : 
            percentage <= 25 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-600">
        {minutes === 0 && seconds === 0 ? 'Time expired!' :
         minutes === 0 && seconds <= 30 ? 'Time almost up!' :
         minutes <= 2 ? 'Hurry up!' :
         percentage <= 25 ? 'Quarter time left' :
         'Time remaining'}
      </div>
    </div>
  )
}
