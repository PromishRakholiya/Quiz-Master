import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getQuizzes } from '../services/quizService.js'
import QuizCard from '../components/QuizCard.jsx'
import { LoadingCard, SkeletonCard } from '../components/LoadingSpinner.jsx'

export default function Dashboard() {
  const { token, user } = useAuth()
  const [data, setData] = React.useState({ quizzes: [], pagination: { currentPage: 1, totalPages: 1 } })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [params, setParams] = React.useState({ page: 1, limit: 12, category: '', difficulty: '', search: '' })
  const [searchFocused, setSearchFocused] = React.useState(false)

  React.useEffect(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    const fetch = async () => {
      try {
        const payload = { ...params }
        // Cleanup empty filters
        if (!payload.category) delete payload.category
        if (!payload.difficulty) delete payload.difficulty
        if (!payload.search) delete payload.search
        const res = await getQuizzes(token, payload)
        setData(res)
        setError('')
      } catch (e) {
        console.error('Dashboard quiz loading error:', e)
        setError(e.message || 'Failed to load quizzes')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [token, params.page, params.limit, params.category, params.difficulty, params.search])

  const onSearchChange = (e) => {
    const value = e.target.value
    setParams(p => ({ ...p, page: 1, search: value }))
  }

  const onSelectChange = (e) => {
    const { name, value } = e.target
    setParams(p => ({ ...p, page: 1, [name]: value }))
  }

  const goPage = (p) => setParams(state => ({ ...state, page: p }))

  const clearFilters = () => {
    setParams({ page: 1, limit: 12, category: '', difficulty: '', search: '' })
  }

  if (!user) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Quiz Master</h2>
        <p className="text-gray-600 mb-6">Please login to see available quizzes and start your learning journey.</p>
        <div className="flex justify-center gap-4">
          <a href="/login" className="btn-primary">Login</a>
          <a href="/signup" className="btn-secondary">Sign Up</a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card-gradient p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-gray-600">Ready to test your knowledge today?</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.pagination.totalQuizzes || 0}</div>
              <div className="text-xs text-gray-500">Available Quizzes</div>
            </div>
            {user.role === 'admin' && (
              <a href="/admin" className="btn-secondary">
                <span className="text-lg">⚙️</span>
                <span>Admin Panel</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Find Your Perfect Quiz</h3>
          {(params.search || params.category || params.difficulty) && (
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300"
            >
              Clear all filters ✕
            </button>
          )}
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          {/* Enhanced Search */}
          <div className="md:col-span-2 relative">
            <label className="label">Search Quizzes</label>
            <div className="relative">
              <input 
                placeholder="Search by title, description, or topic..." 
                value={params.search} 
                onChange={onSearchChange} 
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`input pl-10 transition-all duration-300 ${searchFocused ? 'ring-4 ring-blue-500/20 border-blue-500' : ''}`}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className={`text-lg transition-all duration-300 ${searchFocused ? 'animate-pulse' : ''}`}>🔍</span>
              </div>
              {params.search && (
                <button 
                  onClick={() => setParams(p => ({ ...p, search: '', page: 1 }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Enhanced Category Filter */}
          <div>
            <label className="label">Category</label>
            <div className="relative">
              <select 
                name="category" 
                value={params.category} 
                onChange={onSelectChange} 
                className="select appearance-none pr-10"
              >
                <option value="">All Categories</option>
                <option value="General">🎯 General</option>
                <option value="Mathematics">🔢 Mathematics</option>
                <option value="Science">🔬 Science</option>
                <option value="History">📚 History</option>
                <option value="Geography">🌍 Geography</option>
                <option value="Literature">📖 Literature</option>
                <option value="Technology">💻 Technology</option>
                <option value="Other">📝 Other</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Difficulty Filter */}
          <div>
            <label className="label">Difficulty</label>
            <div className="relative">
              <select 
                name="difficulty" 
                value={params.difficulty} 
                onChange={onSelectChange} 
                className="select appearance-none pr-10"
              >
                <option value="">All Levels</option>
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(params.search || params.category || params.difficulty) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {params.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Search: "{params.search}"
                <button onClick={() => setParams(p => ({ ...p, search: '', page: 1 }))} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {params.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {params.category}
                <button onClick={() => setParams(p => ({ ...p, category: '', page: 1 }))} className="hover:text-purple-900">✕</button>
              </span>
            )}
            {params.difficulty && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {params.difficulty}
                <button onClick={() => setParams(p => ({ ...p, difficulty: '', page: 1 }))} className="hover:text-green-900">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>
          <div className="text-gray-600 mb-6">
            This usually means the backend server is not running or there's a connection issue.
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="font-semibold text-gray-800 mb-2">Quick fixes:</div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>1. Make sure backend is running: <code className="bg-gray-200 px-2 py-1 rounded">npm start</code> in backend folder</div>
              <div>2. Check if API is working: <a href="http://localhost:5000/api/health" target="_blank" className="text-blue-600 underline hover:text-blue-800">http://localhost:5000/api/health</a></div>
              <div>3. Ensure frontend/.env has: <code className="bg-gray-200 px-2 py-1 rounded">VITE_API_URL=http://localhost:5000/api</code></div>
            </div>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
          >
            🔄 Retry Connection
          </button>
        </div>
      ) : data.quizzes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-6">📝</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No quizzes found</h3>
          <div className="text-gray-600 mb-8 max-w-md mx-auto">
            {params.search || params.category || params.difficulty ? (
              <>
                No quizzes match your current filters. Try adjusting your search criteria or clearing filters.
              </>
            ) : user?.role === 'admin' ? (
              <>
                You haven't created any quizzes yet. Create your first quiz to get started!
              </>
            ) : (
              <>
                No published quizzes are available right now. Check back later or contact your admin.
              </>
            )}
          </div>
          <div className="flex justify-center gap-4">
            {(params.search || params.category || params.difficulty) && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            )}
            {user?.role === 'admin' && (
              <a href="/admin" className="btn-primary">
                ➕ Create Your First Quiz
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {data.quizzes.length} of {data.pagination.totalQuizzes} quizzes
            </div>
            <div className="text-sm text-gray-500">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.quizzes.map((q, idx) => (
              <div 
                key={q._id} 
                className="fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <QuizCard quiz={q} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Enhanced Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn-ghost px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={data.pagination.currentPage <= 1 || loading} 
                onClick={() => goPage(data.pagination.currentPage - 1)}
              >
                ← Previous
              </button>
              
              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, data.pagination.currentPage - 2) + i
                  if (pageNum > data.pagination.totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-300 ${
                        pageNum === data.pagination.currentPage
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button 
                className="btn-ghost px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={data.pagination.currentPage >= (data.pagination.totalPages || 1) || loading} 
                onClick={() => goPage(data.pagination.currentPage + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}