import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyHistory } from '../services/attemptService.js'

export default function QuizHistory() {
  const { token } = useAuth()
  const [history, setHistory] = React.useState([])

  React.useEffect(() => {
    if (!token) return
    getMyHistory(token).then(res => setHistory(res.history || []))
  }, [token])

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-3">My Attempts</h2>
      <div className="space-y-2 text-sm">
        {history.map(item => (
          <div key={item._id} className="flex justify-between border-b pb-1">
            <div>
              <div className="font-medium">{item.quizId?.title}</div>
              <div className="text-gray-600">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
            <div className="font-semibold">{item.score} / {item.totalMarks} ({item.percentage}%)</div>
          </div>
        ))}
        {!history.length && <div className="text-gray-600">No attempts yet.</div>}
      </div>
    </div>
  )
}
