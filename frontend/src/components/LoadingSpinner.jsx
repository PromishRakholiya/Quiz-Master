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
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <div className="mt-2 text-sm text-gray-600 animate-pulse">{text}</div>}
    </div>
  )
}

export function LoadingCard({ text = 'Loading...', className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function LoadingOverlay({ text = 'Loading...', show = true }) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <LoadingSpinner size="xl" />
        <div className="mt-4 text-lg font-medium text-gray-700">{text}</div>
      </div>
    </div>
  )
}

export function InlineLoader({ text = 'Loading...', size = 'sm' }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}
