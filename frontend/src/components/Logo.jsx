import React from 'react'

export default function Logo({ size = 'medium', showText = true, className = '' }) {
  const sizes = {
    small: {
      container: 'text-lg',
      brain: 'text-xl',
      lightning: 'text-lg',
      text: 'text-lg font-bold'
    },
    medium: {
      container: 'text-xl',
      brain: 'text-2xl',
      lightning: 'text-xl',
      text: 'text-xl font-bold'
    },
    large: {
      container: 'text-3xl',
      brain: 'text-4xl',
      lightning: 'text-3xl',
      text: 'text-3xl font-bold'
    },
    xlarge: {
      container: 'text-4xl',
      brain: 'text-5xl',
      lightning: 'text-4xl',
      text: 'text-5xl font-bold'
    }
  }

  const currentSize = sizes[size] || sizes.medium

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icons */}
      <div className={`flex items-center gap-1 ${currentSize.container}`}>
        <span className={`${currentSize.brain} animate-pulse`}>🧠</span>
        <span className={`${currentSize.lightning} text-yellow-500`}>⚡</span>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${currentSize.text}`}>
          Quiz Master
        </span>
      )}
    </div>
  )
}

// Alternative logo variations
export function LogoIcon({ size = 'medium', className = '' }) {
  return <Logo size={size} showText={false} className={className} />
}

export function LogoText({ size = 'medium', className = '' }) {
  const sizes = {
    small: 'text-lg font-bold',
    medium: 'text-xl font-bold',
    large: 'text-3xl font-bold',
    xlarge: 'text-5xl font-bold'
  }

  const currentSize = sizes[size] || sizes.medium

  return (
    <span className={`bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${currentSize} ${className}`}>
      Quiz Master
    </span>
  )
}

// Animated logo for loading states
export function AnimatedLogo({ size = 'medium', className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-2xl animate-bounce">🧠</span>
        <span className="text-xl animate-pulse text-yellow-500">⚡</span>
      </div>
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-xl font-bold animate-pulse">
        Quiz Master
      </span>
    </div>
  )
}
