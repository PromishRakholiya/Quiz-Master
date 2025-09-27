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
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [showConfirmSubmit, setShowConfirmSubmit] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    getQuiz(token, quizId).then(res => {
      console.log('Quiz data:', res.quiz)
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
    setShowConfirmSubmit(false)
  }

  const getProgressPercentage = () => {
    if (!attempt?.questions?.length) return 0
    return Math.round((Object.keys(answers).length / attempt.questions.length) * 100)
  }

  const navigateToQuestion = (index) => {
    setCurrentQuestion(Math.max(0, Math.min(index, (attempt?.questions?.length || 1) - 1)))
  }

  if (!quiz) return <LoadingCard text="Loading quiz..." />

  if (!attempt) {
    return (
      <div className="space-y-6">
        <div className="card-gradient p-8">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{quiz.description}</p>
            </div>
            <div className="text-6xl animate-bounce">{quiz.category === 'Mathematics' ? '🔢' : quiz.category === 'Science' ? '🔬' : '🎯'}</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Quiz Details
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Duration', value: `${quiz.duration} minutes`, icon: '⏱️' },
                { label: 'Questions', value: quiz.questionCount || quiz.totalQuestions || 'Not specified', icon: '📝' },
                { label: 'Total Points', value: quiz.totalMarks || 'Not calculated', icon: '🎯' },
                { label: 'Category', value: quiz.category || 'General', icon: '📂' },
                { label: 'Difficulty', value: quiz.difficulty || 'Medium', icon: '⭐' },
                ...(quiz.passingMarks ? [{ label: 'Passing Score', value: `${quiz.passingMarks} points`, icon: '🏆' }] : []),
                ...(quiz.maxAttempts && quiz.maxAttempts > 0 ? [{ label: 'Max Attempts', value: quiz.maxAttempts, icon: '🔄' }] : [])
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium text-gray-700">{item.label}:</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <span className="font-medium text-green-700">Status:</span>
                </div>
                <span className={`font-bold px-3 py-1 rounded-full text-sm ${quiz.isPublished ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {quiz.isPublished ? '✅ Published' : '⏳ Draft'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Instructions
            </h3>
            <div className="space-y-3">
              {[
                'Read each question carefully before answering',
                'You can change your answers before submitting',
                'The timer will start when you begin the quiz',
                'Quiz will auto-submit when time expires',
                ...(quiz.showResultsImmediately ? ['Results will be shown immediately after submission'] : [])
              ].map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-500 text-lg flex-shrink-0">•</span>
                  <span className="text-gray-700">{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn-primary text-lg px-8 py-4 group relative overflow-hidden" 
              onClick={handleStart}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                <span>Start Quiz</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button 
              className="btn-ghost text-lg px-8 py-4" 
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card-gradient p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {result.isPassed ? '🎉' : '😔'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600">Here are your results</p>
            </div>

            <div className="bg-white/80 rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold mb-2 ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.score} / {result.totalMarks}
                </div>
                <div className={`text-2xl font-bold ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.percentage}%
                </div>
              </div>

              <div className="progress-bar mb-4">
                <div 
                  className={`progress-fill ${result.isPassed ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600'}`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>

              <div className={`text-center text-lg font-bold ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {result.isPassed ? '✅ PASSED' : '❌ FAILED'}
              </div>
            </div>

            {result.feedback && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-gray-700">{result.feedback}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="btn-primary flex-1" 
                onClick={() => navigate(`/results/${result.attemptId}`)}
              >
                📊 View Detailed Results
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/dashboard')}
              >
                🏠 Back to Dashboard
              </button>
              <button 
                className="btn-ghost" 
                onClick={() => navigate(`/leaderboard/${quizId}`)}
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
          
          <div>
            <Leaderboard items={leaderboard} />
          </div>
        </div>
      </div>
    )
  }

  const currentQ = attempt.questions[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Time Up Modal */}
      {timer.timeUp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">⏰</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Time's Up!</h2>
            <p className="text-gray-600 mb-6">
              The quiz time has expired. Your answers are being automatically submitted.
            </p>
            <div className="flex justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Submitting your answers...</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="text-4xl mb-4">🤔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Quiz?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
            </p>
            <div className="flex gap-3">
              <button 
                className="btn-danger flex-1" 
                onClick={handleSubmit}
              >
                Yes, Submit
              </button>
              <button 
                className="btn-ghost flex-1" 
                onClick={() => setShowConfirmSubmit(false)}
              >
                Continue Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">Question {currentQuestion + 1} of {attempt.questions.length}</p>
          </div>
          <Timer 
            minutes={timer.minutes} 
            seconds={timer.seconds} 
            totalMinutes={attempt?.timeAllowed || quiz.duration || 30} 
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{getProgressPercentage()}% answered</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2">
          {attempt.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => navigateToQuestion(idx)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ${
                idx === currentQuestion
                  ? 'bg-blue-500 text-white shadow-lg scale-110'
                  : answers[attempt.questions[idx]._id]
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Warnings */}
      {timer.minutes === 0 && timer.seconds <= 30 && timer.seconds > 0 && (
        <div className="card p-4 bg-red-50 border-red-200 animate-pulse">
          <div className="flex items-center gap-3 text-red-700">
            <span className="text-2xl animate-bounce">🚨</span>
            <span className="font-bold">Only {timer.seconds} seconds remaining! Submit your quiz now!</span>
          </div>
        </div>
      )}
      
      {timer.minutes <= 2 && timer.minutes > 0 && (
        <div className="card p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3 text-orange-700">
            <span className="text-xl animate-pulse">⏳</span>
            <span className="font-medium">{timer.minutes} minute{timer.minutes !== 1 ? 's' : ''} remaining. Please review your answers.</span>
          </div>
        </div>
      )}

      {/* Current Question */}
      <div className="fade-in">
        <Question 
          key={currentQ._id} 
          q={currentQ} 
          onAnswer={handleAnswer} 
          index={currentQuestion} 
        />
      </div>
      
      {/* Navigation & Submit */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button 
              className="btn-ghost"
              onClick={() => navigateToQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            <button 
              className="btn-ghost"
              onClick={() => navigateToQuestion(currentQuestion + 1)}
              disabled={currentQuestion === attempt.questions.length - 1}
            >
              Next →
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} / {attempt.questions.length} answered
            </div>
            <button 
              className="btn-success" 
              onClick={() => setShowConfirmSubmit(true)}
              disabled={timer.timeUp}
            >
              {timer.timeUp ? 'Submitting...' : '✅ Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}