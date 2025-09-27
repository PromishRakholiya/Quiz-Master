import React from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getLeaderboard } from '../services/attemptService.js'

export default function LeaderboardPage() {
  const { quizId } = useParams()
  const { token } = useAuth()
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!token) { setLoading(false); return }
    getLeaderboard(token, quizId)
      .then(res => setItems(res.leaderboard || []))
      .catch(() => setError('Failed to load leaderboard'))
      .finally(() => setLoading(false))
  }, [token, quizId])

  if (loading) return <div className="card p-6">Loading leaderboard...</div>
  if (error) return <div className="card p-6 form-error">{error}</div>

  return (
    <div className="card p-6">
      <h1 className="page-title mb-3">Leaderboard</h1>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">No entries yet.</div>
      ) : (
        <ol className="space-y-1">
          {items.map((it, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span>{idx+1}. {it.userId?.firstName} {it.userId?.lastName}</span>
              <span className="font-medium">{it.score} ({it.percentage || '-'}%)</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
