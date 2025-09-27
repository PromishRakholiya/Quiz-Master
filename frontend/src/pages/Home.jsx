import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

export default function Home() {
  const { user } = useAuth()
  const [currentFeature, setCurrentFeature] = React.useState(0)
  
  const features = [
    {
      icon: '🧠',
      title: 'Smart Quizzes',
      description: 'AI-powered questions that adapt to your learning style',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Quick assessments with instant results and feedback',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: '🏆',
      title: 'Master Level',
      description: 'Track progress and achieve mastery in your subjects',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    }
  ]

  // Auto-rotate features
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-12 fade-in">
        {/* Animated Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative">
            <span className="text-6xl animate-bounce float">🧠</span>
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="relative">
            <span className="text-5xl animate-pulse text-yellow-500">⚡</span>
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bounce-in">
            Quiz Master
          </h1>
          <div className="relative">
            <p className="text-2xl md:text-3xl text-gray-600 font-semibold">
              Master Your Knowledge, One Quiz at a Time
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            The ultimate platform for interactive learning and skill assessment with beautiful, engaging quizzes
          </p>
        </div>

        {/* User Section */}
        {user ? (
          <div className="space-y-6 slide-up">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-md mx-auto border border-blue-200">
              <p className="text-xl font-semibold text-gray-800 mb-2">
                Welcome back, <span className="text-blue-600">{user.firstName}</span>! 👋
              </p>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/dashboard" 
                className="btn-primary group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl group-hover:animate-bounce">🚀</span>
                  <span>Go to Dashboard</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="btn-secondary group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-xl group-hover:animate-spin">⚙️</span>
                    <span>Admin Panel</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 slide-up">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 max-w-md mx-auto border border-yellow-200">
              <p className="text-lg text-gray-700 font-medium">
                Join <span className="font-bold text-orange-600">thousands</span> of learners testing their knowledge
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/signup" 
                className="btn-primary group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl group-hover:animate-bounce">✨</span>
                  <span>Sign Up Free</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                to="/login" 
                className="btn-ghost group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl group-hover:animate-pulse">🔐</span>
                  <span>Login</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              <Link 
                to="/login-admin" 
                className="underline hover:text-blue-600 transition-colors duration-300 hover:no-underline"
              >
                Admin? Login here →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Quiz Master?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the future of learning with our advanced quiz platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className={`card-interactive p-8 text-center group relative overflow-hidden ${
                currentFeature === idx ? 'ring-4 ring-blue-200 scale-105' : ''
              }`}
              style={{ 
                transitionDelay: `${idx * 100}ms`,
                animation: currentFeature === idx ? 'pulse-glow 2s ease-in-out infinite' : ''
              }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:animate-bounce transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect border */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Feature indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentFeature(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentFeature === idx 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="card-gradient p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Ready to get started?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Create an account to access all quizzes, track your progress, and compete with learners worldwide
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/signup" 
                  className="btn-primary text-lg px-8 py-4 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-2xl group-hover:animate-bounce">🎯</span>
                    <span>Get Started Now</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link 
                  to="/login" 
                  className="btn-ghost text-lg px-8 py-4 group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl group-hover:animate-pulse">👋</span>
                    <span>I have an account</span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Floating elements */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-8 right-8 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute bottom-4 left-8 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-8 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
        </div>
      </div>
    </div>
  )
}