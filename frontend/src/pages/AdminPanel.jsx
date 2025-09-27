import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getQuizzes, createQuiz, toggleQuizPublication, getQuiz, updateQuiz, deleteQuiz, duplicateQuiz, getQuizStatistics } from '../services/quizService.js'
import { createQuestion, listQuestions, updateQuestion, deleteQuestion } from '../services/questionService.js'
import { useToast } from '../context/ToastContext.jsx'

export default function AdminPanel() {
  const { token } = useAuth()
  const toast = useToast()
  const [data, setData] = React.useState({ quizzes: [] })
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState('')
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    duration: 30,
    category: 'General',
    difficulty: 'Easy'
  })
  const [selectedQuizId, setSelectedQuizId] = React.useState('')
  const [qCreating, setQCreating] = React.useState(false)
  const [qError, setQError] = React.useState('')
  const [createMsg, setCreateMsg] = React.useState('')
  const manageRef = React.useRef(null)
  const [autoPublish, setAutoPublish] = React.useState(true)
  const [editingQuiz, setEditingQuiz] = React.useState(null)
  const [quizQuestions, setQuizQuestions] = React.useState([])
  const [loadingQuestions, setLoadingQuestions] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    title: '',
    description: '',
    duration: 30,
    category: 'General',
    difficulty: 'Easy'
  })
  const [showStats, setShowStats] = React.useState(null)
  const [statsData, setStatsData] = React.useState(null)
  const [qForm, setQForm] = React.useState({
    questionText: '',
    questionType: 'multiple-choice',
    marks: 1,
    negativeMarks: 0,
    difficulty: 'Medium',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: ''
  })

  React.useEffect(() => {
    if (!token) return
    // Show all quizzes (published and unpublished) for admin management
    getQuizzes(token, { limit: 50 })
      .then(setData)
      .catch(err => {
        console.error('Failed to load quizzes:', err)
        setCreateError(`Failed to load quizzes: ${err.message}`)
      })
  }, [token])

  const reload = async () => {
    if (!token) return
    try {
      const res = await getQuizzes(token, { limit: 50 })
      setData(res)
    } catch (err) {
      console.error('Failed to reload quizzes:', err)
      setCreateError(`Failed to reload quizzes: ${err.message}`)
    }
  }

  // Manage Questions handlers
  const onSelectQuiz = async (e) => {
    const quizId = e.target.value
    setSelectedQuizId(quizId)
    
    if (quizId) {
      setLoadingQuestions(true)
      try {
        const res = await listQuestions(token, quizId)
        setQuizQuestions(res.questions || [])
      } catch (err) {
        console.error('Failed to load questions:', err)
        setQuizQuestions([])
      } finally {
        setLoadingQuestions(false)
      }
    } else {
      setQuizQuestions([])
    }
  }
  const onQChange = (e) => setQForm({ ...qForm, [e.target.name]: e.target.value })
  const onQTypeChange = (e) => {
    const val = e.target.value
    // Reset structure according to type
    if (val === 'true-false') {
      setQForm({
        ...qForm,
        questionType: val,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        correctAnswer: ''
      })
    } else if (val === 'fill-in-blank') {
      setQForm({
        ...qForm,
        questionType: val,
        options: [],
        correctAnswer: ''
      })
    } else {
      // multiple-choice: enforce exactly 4 blank options
      setQForm({
        ...qForm,
        questionType: val,
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: ''
      })
    }
  }
  const changeOptionText = (idx, val) => setQForm(f => ({ ...f, options: f.options.map((o,i)=> i===idx? { ...o, text: val }: o) }))
  const toggleOptionCorrect = (idx) => setQForm(f => ({ ...f, options: f.options.map((o,i)=> i===idx? { ...o, isCorrect: !o.isCorrect }: o) }))

  const onCreateQuestion = async (e) => {
    e.preventDefault()
    if (!selectedQuizId) { setQError('Please select a quiz'); return }
    setQCreating(true)
    setQError('')
    try {
      const payload = {
        questionText: qForm.questionText,
        questionType: qForm.questionType,
        marks: Number(qForm.marks),
        negativeMarks: Number(qForm.negativeMarks) || 0,
        difficulty: qForm.difficulty,
      }
      if (qForm.questionType === 'fill-in-blank') {
        payload.correctAnswer = qForm.correctAnswer
      } else {
        payload.options = qForm.options
      }
      await createQuestion(token, selectedQuizId, payload)
      toast.success(`Question ${quizQuestions.length + 1} added successfully!`)
      
      // Refresh both quiz list and questions list
      await reload()
      
      // Reload questions for the selected quiz
      try {
        const res = await listQuestions(token, selectedQuizId)
        setQuizQuestions(res.questions || [])
      } catch (err) {
        console.error('Failed to reload questions:', err)
      }
      
      // Auto-publish after first question (optional)
      if (autoPublish) {
        try {
          const res = await getQuiz(token, selectedQuizId)
          if (res?.quiz && res.quiz.isPublished === false) {
            await toggleQuizPublication(token, selectedQuizId)
            await reload()
            toast.success('Quiz auto-published!')
          }
        } catch (err) {
          console.error('Failed to auto-publish quiz', err)
        }
      }
      // reset form minimal
      setQForm({
        questionText: '',
        questionType: qForm.questionType,
        marks: 1,
        negativeMarks: 0,
        difficulty: qForm.difficulty,
        options: qForm.questionType === 'fill-in-blank' ? [] : [ { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false } ],
        correctAnswer: ''
      })
    } catch (err) {
      setQError(err.message || 'Failed to create question')
    } finally {
      setQCreating(false)
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })

  const startEdit = (quiz) => {
    setEditingQuiz(quiz._id)
    setEditForm({
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      category: quiz.category,
      difficulty: quiz.difficulty
    })
  }

  const cancelEdit = () => {
    setEditingQuiz(null)
    setEditForm({ title: '', description: '', duration: 30, category: 'General', difficulty: 'Easy' })
  }

  const saveEdit = async () => {
    try {
      await updateQuiz(token, editingQuiz, editForm)
      toast.success('Quiz updated successfully!')
      await reload()
      cancelEdit()
    } catch (err) {
      toast.error(err.message || 'Failed to update quiz')
    }
  }

  const handleDelete = async (quizId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return
    try {
      await deleteQuiz(token, quizId)
      toast.success('Quiz deleted successfully!')
      await reload()
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz')
    }
  }

  const handleDuplicate = async (quizId, title) => {
    const newTitle = prompt(`Enter title for duplicated quiz:`, `${title} (Copy)`)
    if (!newTitle) return
    try {
      await duplicateQuiz(token, quizId, newTitle)
      toast.success('Quiz duplicated successfully!')
      await reload()
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate quiz')
    }
  }

  const viewStats = async (quizId, title) => {
    try {
      const stats = await getQuizStatistics(token, quizId)
      setStatsData({ ...stats, quizTitle: title })
      setShowStats(quizId)
    } catch (err) {
      toast.error(err.message || 'Failed to load statistics')
    }
  }

  const onCreate = async (e) => {
    e.preventDefault()
    // Client-side validation
    if (form.title.length < 3) {
      setCreateError('Title must be at least 3 characters')
      return
    }
    if (form.description.length < 10) {
      setCreateError('Description must be at least 10 characters')
      return
    }
    setCreating(true)
    setCreateError('')
    setCreateMsg('')
    try {
      const created = await createQuiz(token, {
        title: form.title,
        description: form.description,
        duration: Number(form.duration),
        category: form.category,
        difficulty: form.difficulty,
        randomizeQuestions: true,
        randomizeOptions: true,
        showResultsImmediately: true
      })
      setForm({ title: '', description: '', duration: 30, category: 'General', difficulty: 'Easy' })
      await reload()
      // Auto-select the newly created quiz for adding questions
      const newId = created?.quiz?._id || created?.quiz?.id
      if (newId) {
        setSelectedQuizId(newId)
        setCreateMsg('Quiz created. Add your first question below.')
        // Smooth scroll to manage questions
        setTimeout(() => {
          manageRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create quiz')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h2 className="section-title mb-2">Create a new quiz</h2>
        {createError && <div className="form-error mb-2">{createError}</div>}
        <form onSubmit={onCreate} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input name="title" value={form.title} onChange={onChange} className="input" required minLength={3} />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input name="duration" type="number" min={1} max={300} value={form.duration} onChange={onChange} className="input" required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} className="input" rows={3} required minLength={10} maxLength={1000} />
            <p className="form-hint">Minimum 10 characters required</p>
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={onChange} className="select">
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
            <select name="difficulty" value={form.difficulty} onChange={onChange} className="select">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create quiz'}</button>
          </div>
        </form>
      </div>
      {createMsg && <div className="card p-4 form-success">{createMsg}</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.quizzes.map(q => (
          <div key={q._id} className="card p-4">
            {editingQuiz === q._id ? (
              <div className="space-y-3">
                <input 
                  name="title" 
                  value={editForm.title} 
                  onChange={onEditChange} 
                  className="input text-sm" 
                  placeholder="Quiz title"
                  minLength={3}
                />
                <textarea 
                  name="description" 
                  value={editForm.description} 
                  onChange={onEditChange} 
                  className="input text-sm" 
                  rows={2}
                  placeholder="Quiz description"
                  minLength={10}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    name="duration" 
                    type="number" 
                    min={1} 
                    max={300} 
                    value={editForm.duration} 
                    onChange={onEditChange} 
                    className="input text-sm" 
                  />
                  <select name="category" value={editForm.category} onChange={onEditChange} className="select text-sm">
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
                <div className="flex gap-2">
                  <button className="btn btn-primary text-xs" onClick={saveEdit}>Save</button>
                  <button className="btn btn-secondary text-xs" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium">{q.title}</div>
                <div className="text-xs text-gray-600 mb-2">{q.description}</div>
                <div className="text-xs text-gray-500 mb-2">
                  📝 {q.questionCount || q.totalQuestions || 0} questions • 
                  ⏱️ {q.duration} min • 
                  📊 {q.totalMarks || 0} marks • 
                  📂 {q.category} • 
                  🎯 {q.difficulty}
                </div>
                <div className="text-xs mb-2">
                  <span className={`px-2 py-1 rounded ${q.isPublished ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {q.isPublished ? '✅ Published' : '⏳ Draft'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    className={`btn text-xs ${q.isPublished ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={async ()=>{
                      try {
                        await toggleQuizPublication(token, q._id)
                        await reload()
                        toast.success(`Quiz ${q.isPublished ? 'unpublished' : 'published'}!`)
                      } catch (e) {
                        toast.error(e.message || 'Failed to toggle publish')
                      }
                    }}
                  >
                    {q.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="btn btn-secondary text-xs" onClick={() => startEdit(q)}>Edit</button>
                  <button className="btn btn-secondary text-xs" onClick={() => viewStats(q._id, q.title)}>Stats</button>
                  <button className="btn btn-secondary text-xs" onClick={() => handleDuplicate(q._id, q.title)}>Duplicate</button>
                  <button className="btn text-xs bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleDelete(q._id, q.title)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Manage Questions */}
      <div className="card p-6" ref={manageRef}>
        <h2 className="section-title mb-4">📝 Manage Quiz Questions</h2>
        
        {/* Quiz Selection */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div>
            <label className="label">Select quiz</label>
            <select value={selectedQuizId} onChange={onSelectQuiz} className="select">
              <option value="">-- Choose a quiz --</option>
              {data.quizzes.map(q => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.questionCount || 0} questions)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="label inline-flex items-center gap-2">
              <input type="checkbox" checked={autoPublish} onChange={e=>setAutoPublish(e.target.checked)} />
              Auto-publish after first question
            </label>
          </div>
        </div>

        {/* Existing Questions List */}
        {selectedQuizId && (
          <div className="mb-6">
            <h3 className="section-title mb-3">
              📋 Current Questions ({quizQuestions.length})
            </h3>
            {loadingQuestions ? (
              <div className="text-sm text-gray-600">Loading questions...</div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {quizQuestions.map((q, idx) => (
                  <div key={q._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {q.questionText}
                      </div>
                      <div className="text-xs text-gray-500">
                        {q.questionType} • {q.marks} marks • {q.difficulty}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        className="text-xs text-red-600 hover:text-red-800"
                        onClick={async () => {
                          if (confirm('Delete this question?')) {
                            try {
                              await deleteQuestion(token, q._id)
                              toast.success('Question deleted!')
                              // Reload questions
                              const res = await listQuestions(token, selectedQuizId)
                              setQuizQuestions(res.questions || [])
                              await reload() // Update quiz counts
                            } catch (err) {
                              toast.error('Failed to delete question')
                            }
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No questions added yet. Add your first question below.
              </div>
            )}
          </div>
        )}

        {/* Add New Question Form */}
        <div className="border-t pt-6">
          <h3 className="section-title mb-3">
            ➕ Add New Question {selectedQuizId && `(Question #${quizQuestions.length + 1})`}
          </h3>
        <form onSubmit={onCreateQuestion} className="space-y-4">
          {qError && <div className="form-error">{qError}</div>}
          <div>
            <label className="label">Question text</label>
            <textarea name="questionText" value={qForm.questionText} onChange={onQChange} className="input" rows={3} required />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="label">Type</label>
              <select name="questionType" value={qForm.questionType} onChange={onQTypeChange} className="select">
                <option value="multiple-choice">Multiple choice</option>
                <option value="true-false">True/False</option>
                <option value="fill-in-blank">Descriptive (fill in)</option>
              </select>
            </div>
            <div>
              <label className="label">Marks</label>
              <input name="marks" type="number" min={0.5} step={0.5} value={qForm.marks} onChange={onQChange} className="input" required />
            </div>
            <div>
              <label className="label">Negative marks</label>
              <input name="negativeMarks" type="number" min={0} step={0.5} value={qForm.negativeMarks} onChange={onQChange} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select name="difficulty" value={qForm.difficulty} onChange={onQChange} className="select">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {qForm.questionType === 'fill-in-blank' ? (
            <div>
              <label className="label">Correct answer</label>
              <input name="correctAnswer" value={qForm.correctAnswer} onChange={onQChange} className="input" required />
            </div>
          ) : (
            <div>
              <label className="label">Options</label>
              <div className="space-y-2">
                {qForm.options.map((opt, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input className="col-span-9 input" placeholder={`Option ${idx+1}`} value={opt.text} onChange={(e)=>changeOptionText(idx, e.target.value)} required />
                    <label className="col-span-2 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={opt.isCorrect} onChange={()=>toggleOptionCorrect(idx)} /> Correct
                    </label>
                  </div>
                ))}
              </div>
              {qForm.questionType === 'true-false' && (
                <p className="form-hint mt-1">Toggle which of True/False is correct.</p>
              )}
            </div>
          )}

          <div>
            <button className="btn btn-primary" disabled={qCreating || !selectedQuizId}>{qCreating ? 'Adding...' : 'Add question'}</button>
          </div>
        </form>
        </div>
      </div>

      {/* Statistics Modal */}
      {showStats && statsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Quiz Statistics: {statsData.quizTitle}</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowStats(null)}
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{statsData.statistics?.totalAttempts || 0}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{statsData.statistics?.averageScore?.toFixed(1) || 0}</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{statsData.statistics?.averagePercentage?.toFixed(1) || 0}%</div>
                <div className="text-sm text-gray-600">Average %</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{statsData.statistics?.passRate?.toFixed(1) || 0}%</div>
                <div className="text-sm text-gray-600">Pass Rate</div>
              </div>
            </div>

            {statsData.recentAttempts?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Recent Attempts</h3>
                <div className="space-y-2">
                  {statsData.recentAttempts.slice(0, 10).map((attempt, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{attempt.userName}</span>
                      <div className="text-sm">
                        <span className="font-medium">{attempt.score} ({attempt.percentage}%)</span>
                        <span className="text-gray-500 ml-2">{new Date(attempt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {statsData.questionStats?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Question Performance</h3>
                <div className="space-y-2">
                  {statsData.questionStats.map((q, idx) => (
                    <div key={q.questionId} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Q{idx + 1}: {q.questionText}</span>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded ${q.successRate >= 70 ? 'bg-green-100 text-green-700' : q.successRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {q.successRate}% correct
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {q.correctAttempts}/{q.totalAttempts} attempts • Avg time: {q.averageTime}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
