import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="text-center space-y-8 fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">🧠</span>
          <span className="text-4xl">⚡</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent bounce-in">
          Quiz Master
        </h1>
        <p className="text-xl text-gray-600 font-medium">Master Your Knowledge, One Quiz at a Time</p>
        <p className="text-lg text-gray-500">The ultimate platform for interactive learning and skill assessment</p>
      </div>

      {user ? (
        <div className="space-y-4 slide-up">
          <p className="text-lg">Welcome back, <span className="font-semibold">{user.firstName}</span>! 👋</p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard" className="btn btn-primary">🚀 Go to Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin" className="btn btn-secondary">⚙️ Admin Panel</Link>}
          </div>
        </div>
      ) : (
        <div className="space-y-4 slide-up">
          <p className="text-lg text-gray-600">Join thousands of learners testing their knowledge</p>
          <div className="flex justify-center gap-4">
            <Link to="/signup" className="btn btn-primary">✨ Sign Up</Link>
            <Link to="/login" className="btn btn-secondary">🔐 Login</Link>
          </div>
          <div className="text-sm text-gray-500">
            <Link to="/login-admin" className="underline hover:text-gray-700">Admin? Login here</Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="card p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Smart Quizzes</h3>
          <p className="text-gray-600">AI-powered questions that adapt to your learning style</p>
        </div>
        <div className="card p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold mb-2 text-purple-600">Lightning Fast</h3>
          <p className="text-gray-600">Quick assessments with instant results and feedback</p>
        </div>
        <div className="card p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold mb-2 text-green-600">Master Level</h3>
          <p className="text-gray-600">Track progress and achieve mastery in your subjects</p>
        </div>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🚀 Ready to get started?</h3>
        <p className="text-gray-600 mb-4">Create an account to access all quizzes and track your progress</p>
        {!user && (
          <Link to="/signup" className="btn btn-primary">Get Started Now</Link>
        )}
      </div>
    </div>
  )
}
