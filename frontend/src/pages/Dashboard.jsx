import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getQuizzes } from '../services/quizService.js'
import QuizCard from '../components/QuizCard.jsx'
import ApiHealthCheck from '../components/ApiHealthCheck.jsx'
import { LoadingCard } from '../components/LoadingSpinner.jsx'

export default function Dashboard() {
  const { token, user } = useAuth()
  const [data, setData] = React.useState({ quizzes: [], pagination: { currentPage: 1, totalPages: 1 } })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [params, setParams] = React.useState({ page: 1, limit: 12, category: '', difficulty: '', search: '' })
  const [typingTimer, setTypingTimer] = React.useState(null)

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
    if (typingTimer) clearTimeout(typingTimer)
    // debounce already handled by effect's dependency timing in UI typing; keeping here for UX can be optional
  }

  const onSelectChange = (e) => {
    const { name, value } = e.target
    setParams(p => ({ ...p, page: 1, [name]: value }))
  }

  const goPage = (p) => setParams(state => ({ ...state, page: p }))

  if (!user) return <div className="card p-6"><h2 className="text-lg font-semibold mb-2">Welcome</h2><p className="text-sm">Please login to see available quizzes.</p></div>

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="label">Search</label>
            <input placeholder="Search quizzes..." value={params.search} onChange={onSearchChange} className="input" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={params.category} onChange={onSelectChange} className="select">
              <option value="">All</option>
              <option>General</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>History</option>
              <option>Geography</option>
              <option>Literature</option>
              <option>Technology</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select name="difficulty" value={params.difficulty} onChange={onSelectChange} className="select">
              <option value="">All</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingCard text="Loading quizzes..." />
      ) : error ? (
        <div className="card p-6">
          <div className="text-red-600 font-medium mb-2">❌ {error}</div>
          <div className="text-sm text-gray-600 mb-4">
            This usually means the backend server is not running or there's a connection issue.
          </div>
          <div className="space-y-2 text-sm">
            <div><strong>Quick fixes:</strong></div>
            <div>1. Make sure backend is running: <code className="bg-gray-100 px-2 py-1 rounded">npm start</code> in backend folder</div>
            <div>2. Check if API is working: <a href="http://localhost:5000/api/health" target="_blank" className="text-blue-600 underline">http://localhost:5000/api/health</a></div>
            <div>3. Ensure frontend/.env has: <code className="bg-gray-100 px-2 py-1 rounded">VITE_API_URL=http://localhost:5000/api</code></div>
          </div>
          <button 
            className="btn btn-primary mt-4" 
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
        </div>
      ) : data.quizzes.length === 0 ? (
        <div className="card p-6 text-center">
          <div className="text-gray-500 mb-4">📝 No quizzes available</div>
          <div className="text-sm text-gray-600 mb-4">
            {user?.role === 'admin' ? 
              'Create your first quiz to get started!' : 
              'No published quizzes found. Check back later or contact your admin.'
            }
          </div>
          {user?.role === 'admin' && (
            <a href="/admin" className="btn btn-primary">➕ Create Quiz</a>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.quizzes.map(q => <QuizCard key={q._id} quiz={q} />)}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {data.pagination.currentPage} of {data.pagination.totalPages}</div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" disabled={data.pagination.currentPage <= 1 || loading} onClick={() => goPage(data.pagination.currentPage - 1)}>Prev</button>
          <button className="btn btn-primary" disabled={data.pagination.currentPage >= (data.pagination.totalPages || 1) || loading} onClick={() => goPage(data.pagination.currentPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
