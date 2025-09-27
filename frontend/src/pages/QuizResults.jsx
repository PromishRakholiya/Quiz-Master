import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAttemptById } from '../services/attemptService.js'

export default function QuizResults() {
  const { attemptId } = useParams()
  const { token } = useAuth()
  const [attempt, setAttempt] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!token || !attemptId) return
    getAttemptById(token, attemptId)
      .then(res => setAttempt(res.attempt))
      .catch(err => setError(err.message || 'Failed to load results'))
      .finally(() => setLoading(false))
  }, [token, attemptId])

  if (loading) return <div className="card p-6">Loading results...</div>
  if (error) return <div className="card p-6 form-error">{error}</div>
  if (!attempt) return <div className="card p-6">Results not found</div>

  const { quizId, userId, score, totalMarks, percentage, isPassed, answers, status } = attempt
  const quiz = quizId // populated quiz object

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="page-title">{quiz?.title || 'Quiz Results'}</h1>
            <p className="text-gray-600">{userId?.firstName} {userId?.lastName}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {score}/{totalMarks} ({percentage}%)
            </div>
            <div className={`text-sm font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {isPassed ? '✅ PASSED' : '❌ FAILED'}
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Status:</span>
            <div className="font-medium capitalize">{status}</div>
          </div>
          <div>
            <span className="text-gray-500">Questions:</span>
            <div className="font-medium">{answers?.length || 0}</div>
          </div>
          <div>
            <span className="text-gray-500">Correct:</span>
            <div className="font-medium text-green-600">
              {answers?.filter(a => a.isCorrect).length || 0}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Incorrect:</span>
            <div className="font-medium text-red-600">
              {answers?.filter(a => !a.isCorrect).length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Results */}
      <div className="space-y-4">
        <h2 className="section-title">Question-by-Question Review</h2>
        {answers?.map((answer, idx) => (
          <QuestionResult 
            key={answer.questionId} 
            answer={answer} 
            questionNumber={idx + 1}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="card p-6">
        <div className="flex gap-3">
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
          <Link to={`/leaderboard/${quiz?._id}`} className="btn btn-secondary">View Leaderboard</Link>
          <Link to="/history" className="btn btn-secondary">My History</Link>
        </div>
      </div>
    </div>
  )
}

function QuestionResult({ answer, questionNumber }) {
  const { questionId, userAnswer, isCorrect, marksAwarded, timeSpent } = answer
  
  // This would ideally come from the populated question data
  // For now, we'll show what we have from the attempt
  
  return (
    <div className={`card p-4 border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Q{questionNumber}.</span>
          <span className={`text-sm px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isCorrect ? '✅ Correct' : '❌ Incorrect'}
          </span>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>Marks: {marksAwarded}</div>
          {timeSpent && <div>Time: {Math.round(timeSpent)}s</div>}
        </div>
      </div>
      
      <div className="text-sm">
        <div className="mb-2">
          <span className="text-gray-600">Your answer:</span>
          <div className="font-medium">{Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}</div>
        </div>
        
        {!isCorrect && (
          <div className="text-red-600">
            <span>Correct answer will be shown if enabled by quiz settings</span>
          </div>
        )}
      </div>
    </div>
  )
}
