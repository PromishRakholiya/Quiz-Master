import React from 'react'

export default function Logo({ size = 'medium', showText = true, className = '' }) {
  const [isHovered, setIsHovered] = React.useState(false)
  
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
    <div 
      className={`flex items-center gap-3 cursor-pointer transition-all duration-300 ${isHovered ? 'scale-110' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Icons with enhanced animations */}
      <div className={`flex items-center gap-1 ${currentSize.container} relative`}>
        <div className="relative">
          <span className={`${currentSize.brain} transition-all duration-500 ${isHovered ? 'animate-bounce' : 'animate-pulse'}`}>
            🧠
          </span>
          {isHovered && (
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
          )}
        </div>
        
        <div className="relative">
          <span className={`${currentSize.lightning} text-yellow-500 transition-all duration-300 ${isHovered ? 'animate-spin' : ''}`}>
            ⚡
          </span>
          {isHovered && (
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.2s' }}></div>
          )}
        </div>
        
        {/* Connecting spark effect */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 animate-pulse opacity-60"></div>
          </div>
        )}
      </div>
      
      {/* Logo Text with enhanced gradient */}
      {showText && (
        <div className="relative">
          <span className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${currentSize.text} transition-all duration-300 ${isHovered ? 'from-blue-500 via-purple-500 to-pink-500' : ''}`}>
            Quiz Master
          </span>
          
          {/* Shimmer effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          )}
        </div>
      )}
      
      {/* Floating particles effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-2 right-0 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-0 left-2 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.6s' }}></div>
        </div>
      )}
    </div>
  )
}

// Alternative logo variations with enhanced interactivity
export function LogoIcon({ size = 'medium', className = '' }) {
  return <Logo size={size} showText={false} className={className} />
}

export function LogoText({ size = 'medium', className = '' }) {
  const [isHovered, setIsHovered] = React.useState(false)
  
  const sizes = {
    small: 'text-lg font-bold',
    medium: 'text-xl font-bold',
    large: 'text-3xl font-bold',
    xlarge: 'text-5xl font-bold'
  }

  const currentSize = sizes[size] || sizes.medium

  return (
    <div 
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${currentSize} ${className} transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
        Quiz Master
      </span>
      
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
      )}
    </div>
  )
}

// Animated logo for loading states
export function AnimatedLogo({ size = 'medium', className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1 relative">
        <span className="text-3xl animate-bounce">🧠</span>
        <span className="text-2xl animate-pulse text-yellow-500">⚡</span>
        
        {/* Animated connection */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-yellow-400 animate-pulse opacity-60"></div>
        </div>
      </div>
      
      <div className="relative">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold animate-pulse">
          Quiz Master
        </span>
        
        {/* Loading dots */}
        <div className="flex space-x-1 mt-1">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}