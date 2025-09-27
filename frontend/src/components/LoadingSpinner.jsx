import React from 'react'

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-blue-200 rounded-full animate-spin`}></div>
        {/* Inner spinning element */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full animate-spin`}></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      {text && (
        <div className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
          {text}
          <span className="loading-dots"></span>
        </div>
      )}
    </div>
  )
}

export function LoadingCard({ text = 'Loading...', className = '' }) {
  return (
    <div className={`card p-8 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="xl" />
        <div className="text-lg font-semibold text-gray-700">{text}</div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingOverlay({ text = 'Loading...', show = true }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="xl" />
          <div className="text-xl font-bold text-gray-800">{text}</div>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InlineLoader({ text = 'Loading...', size = 'sm' }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
      <LoadingSpinner size={size} />
      <span className="text-sm font-medium text-blue-700">{text}</span>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-12"></div>
      </div>
    </div>
  )
}