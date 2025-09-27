// Robust API URL configuration with multiple fallbacks
const API_URL = import.meta.env.VITE_API_URL || 
                import.meta.env.VITE_REACT_APP_API_URL || 
                'http://localhost:5000/api'

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('🔗 API Configuration:')
  console.log('  API_URL:', API_URL)
  console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL)
  console.log('  Environment:', import.meta.env.MODE)
}

// Utility to report API status
const reportApiStatus = (success, error = null, url = '') => {
  if (success) {
    window.dispatchEvent(new CustomEvent('api-success'))
  } else {
    window.dispatchEvent(new CustomEvent('api-error', { 
      detail: { error: error?.message || 'Unknown error', url } 
    }))
  }
}

export async function getQuizzes(token, params = {}) {
  const url = `${API_URL}/quizzes?${new URLSearchParams(params).toString()}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      let msg = 'Failed to fetch quizzes'
      try {
        const err = await res.json()
        if (err?.errors?.length) msg = err.errors.map(e => e.msg).join(', ')
        else if (err?.message) msg = err.message
      } catch {}
      const error = new Error(msg)
      reportApiStatus(false, error, url)
      throw error
    }
    const data = await res.json()
    reportApiStatus(true)
    return data
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      reportApiStatus(false, new Error('Network connection failed'), url)
    }
    throw err
  }
}

export async function toggleQuizPublication(token, quizId) {
  const res = await fetch(`${API_URL}/quizzes/${quizId}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    let msg = 'Failed to toggle publication'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function getQuiz(token, quizId) {
  const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch quiz')
  return res.json()
}

export async function createQuiz(token, payload) {
  const res = await fetch(`${API_URL}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = 'Failed to create quiz'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function updateQuiz(token, quizId, payload) {
  const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = 'Failed to update quiz'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function deleteQuiz(token, quizId) {
  const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    let msg = 'Failed to delete quiz'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function duplicateQuiz(token, quizId, title) {
  const res = await fetch(`${API_URL}/quizzes/${quizId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) {
    let msg = 'Failed to duplicate quiz'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function getQuizStatistics(token, quizId) {
  const res = await fetch(`${API_URL}/quizzes/${quizId}/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    let msg = 'Failed to fetch quiz statistics'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}
