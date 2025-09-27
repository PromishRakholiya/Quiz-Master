const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function listQuestions(token, quizId) {
  const res = await fetch(`${API_URL}/questions/${quizId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load questions')
  return res.json()
}

export async function createQuestion(token, quizId, payload) {
  const res = await fetch(`${API_URL}/questions/${quizId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = 'Failed to create question'
    try {
      const err = await res.json()
      if (err?.errors?.length) {
        msg = err.errors.map(e => e.msg).join(', ')
      } else if (err?.message) {
        msg = err.message
      }
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function updateQuestion(token, questionId, payload) {
  const res = await fetch(`${API_URL}/questions/${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = 'Failed to update question'
    try {
      const err = await res.json()
      if (err?.errors?.length) {
        msg = err.errors.map(e => e.msg).join(', ')
      } else if (err?.message) {
        msg = err.message
      }
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function deleteQuestion(token, questionId) {
  const res = await fetch(`${API_URL}/questions/${questionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    let msg = 'Failed to delete question'
    try {
      const err = await res.json()
      msg = err?.message || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}
