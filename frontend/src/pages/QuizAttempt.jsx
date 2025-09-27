import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getQuiz } from '../services/quizService.js'
import { startAttempt, submitAttempt, getLeaderboard } from '../services/attemptService.js'
import useTimer from '../hooks/useTimer.js'
import Timer from '../components/Timer.jsx'
import Question from '../components/Question.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import { LoadingCard } from '../components/LoadingSpinner.jsx'

export default function QuizAttempt() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [quiz, setQuiz] = React.useState(null)
  const [attempt, setAttempt] = React.useState(null)
  const [answers, setAnswers] = React.useState({})
  const [leaderboard, setLeaderboard] = React.useState([])
  const [result, setResult] = React.useState(null)

  React.useEffect(() => {
    if (!token) return
    getQuiz(token, quizId).then(res => {
      console.log('Quiz data:', res.quiz) // Debug log
      setQuiz(res.quiz)
    }).catch(err => {
      console.error('Failed to load quiz:', err)
    })
  }, [quizId, token])

  const handleStart = async () => {
    const res = await startAttempt(token, quizId)
    setAttempt(res)
  }

  const timer = useTimer(attempt?.timeAllowed || 0, async () => {
    if (!attempt || result) return
    console.log('⏰ Time up! Auto-submitting quiz...')
    await handleSubmit()
  })

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    if (!attempt) return
    const ansArray = Object.entries(answers).map(([questionId, userAnswer]) => ({ questionId, userAnswer }))
    const res = await submitAttempt(token, attempt.attemptId, ansArray)
    setResult(res.result)
    const lb = await getLeaderboard(token, quizId)
    setLeaderboard(lb.leaderboard)
  }

  if (!quiz) return <LoadingCard text="Loading quiz..." />

  if (!attempt) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <h1 className="page-title mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="section-title mb-3">Quiz Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{quiz.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{quiz.questionCount || quiz.totalQuestions || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{quiz.totalMarks || 'Not calculated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{quiz.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">{quiz.difficulty || 'Medium'}</span>
                </div>
                {quiz.passingMarks && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passing Score:</span>
                    <span className="font-medium">{quiz.passingMarks} marks</span>
                  </div>
                )}
                {quiz.maxAttempts && quiz.maxAttempts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Attempts:</span>
                    <span className="font-medium">{quiz.maxAttempts}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${quiz.isPublished ? 'text-green-600' : 'text-orange-600'}`}>
                    {quiz.isPublished ? '✅ Published' : '⏳ Draft'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="section-title mb-3">Instructions</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Read each question carefully before answering</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>You can change your answers before submitting</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>The timer will start when you begin the quiz</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Quiz will auto-submit when time expires</span>
                </div>
                {quiz.showResultsImmediately && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Results will be shown immediately after submission</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={handleStart}>
              🚀 Start Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-4">
          <h2 className="text-lg font-semibold mb-2">Your Result</h2>
          <div className={`text-2xl font-bold mb-2 ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {result.score} / {result.totalMarks} ({result.percentage}%)
          </div>
          <div className={`text-sm font-medium mb-4 ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {result.isPassed ? '✅ PASSED' : '❌ FAILED'}
          </div>
          <div className="mb-4 text-gray-600">{result.feedback}</div>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={()=>navigate(`/results/${result.attemptId}`)}>View Detailed Results</button>
            <button className="btn btn-secondary" onClick={()=>navigate('/dashboard')}>Back to Dashboard</button>
            <button className="btn btn-secondary" onClick={()=>navigate(`/leaderboard/${quizId}`)}>View Leaderboard</button>
          </div>
        </div>
        <Leaderboard items={leaderboard} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Time Up Modal */}
      {timer.timeUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Time's Up!</h2>
            <p className="text-gray-600 mb-4">
              The quiz time has expired. Your answers have been automatically submitted.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Submitting your answers...</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{quiz.title}</h1>
        <Timer 
          minutes={timer.minutes} 
          seconds={timer.seconds} 
          totalMinutes={attempt?.timeAllowed || quiz.duration || 30} 
        />
      </div>

      {/* Timer warning messages */}
      {timer.minutes === 0 && timer.seconds <= 30 && timer.seconds > 0 && (
        <div className="card p-3 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">⚠️</span>
            <span className="font-medium">Only {timer.seconds} seconds remaining! Submit your quiz now!</span>
          </div>
        </div>
      )}
      
      {timer.minutes <= 2 && timer.minutes > 0 && (
        <div className="card p-3 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700">
            <span className="text-lg">⏳</span>
            <span className="font-medium">{timer.minutes} minute{timer.minutes !== 1 ? 's' : ''} remaining. Please review your answers.</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {attempt.questions.map((q, idx) => (
          <Question key={q._id} q={q} onAnswer={handleAnswer} index={idx} />
        ))}
      </div>
      
      <div className="flex gap-3">
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={timer.timeUp}
        >
          {timer.timeUp ? 'Submitting...' : 'Submit Quiz'}
        </button>
        <div className="text-sm text-gray-600 flex items-center">
          Progress: {Object.keys(answers).length} / {attempt.questions.length} questions answered
        </div>
      </div>
    </div>
  )
}
