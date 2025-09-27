import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import Dashboard from './pages/Dashboard.jsx'
import QuizAttempt from './pages/QuizAttempt.jsx'
import QuizHistory from './pages/QuizHistory.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import LeaderboardPage from './pages/Leaderboard.jsx'
import QuizResults from './pages/QuizResults.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import SmartHealthCheck from './components/SmartHealthCheck.jsx'
import Logo from './components/Logo.jsx'

function NavBar() {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)
  const profileRef = React.useRef(null)
  const mobileMenuRef = React.useRef(null)

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:scale-105 transition-transform">
          <Logo size="medium" className="hover:opacity-80 transition-opacity" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="text-lg">📚</span>
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/history" 
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="text-lg">📊</span>
                <span>History</span>
              </Link>

              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}

          {/* User Profile or Auth Buttons */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img 
                  src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors"
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-blue-600 capitalize font-medium">{user.role}</div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span className="text-lg">👤</span>
                    <span>My Profile</span>
                  </Link>
                  
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <span className="text-lg">📚</span>
                    <span>My Quizzes</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <hr className="my-2" />
                  
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false)
                      logout()
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-lg">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="text-lg">🔑</span>
                <span>Login</span>
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-lg">✨</span>
                <span>Sign Up</span>
              </Link>
              <Link 
                to="/login-admin" 
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors underline"
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img 
                src={user.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              />
            </button>
          )}
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            ref={mobileMenuRef}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container py-4 space-y-2">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-lg">📚</span>
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/history" 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-lg">📊</span>
                  <span>History</span>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="text-lg">⚙️</span>
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-lg">👤</span>
                  <span>My Profile</span>
                </Link>

                <hr className="my-2" />

                <button 
                  onClick={() => {
                    setShowMobileMenu(false)
                    logout()
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-lg">🔑</span>
                  <span>Login</span>
                </Link>
                
                <Link 
                  to="/signup" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-lg">✨</span>
                  <span>Sign Up</span>
                </Link>
                
                <Link 
                  to="/login-admin" 
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-lg">⚙️</span>
                  <span>Admin Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container py-6">
        <SmartHealthCheck />
        {children}
      </div>
    </div>
  )
}


function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/dashboard" element={<Layout><ErrorBoundary><Dashboard /></ErrorBoundary></Layout>} />
        <Route path="/attempt/:quizId" element={<Layout><QuizAttempt /></Layout>} />
        <Route path="/results/:attemptId" element={<ProtectedRoute><Layout><QuizResults /></Layout></ProtectedRoute>} />
        <Route path="/leaderboard/:quizId" element={<Layout><LeaderboardPage /></Layout>} />
        <Route path="/history" element={<Layout><QuizHistory /></Layout>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout><AdminPanel /></Layout></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-admin" element={<Login expectedRole="admin" />} />
        <Route path="/signup" element={<Layout><Signup roleDefault="student" /></Layout>} />
        <Route path="/signup-admin" element={<Layout><Signup roleDefault="admin" /></Layout>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
