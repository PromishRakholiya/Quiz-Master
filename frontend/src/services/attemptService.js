const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function startAttempt(token, quizId) {
  const res = await fetch(`${API_URL}/attempts/start/${quizId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to start attempt')
  return res.json()
}

export async function submitAttempt(token, attemptId, answers) {
  const res = await fetch(`${API_URL}/attempts/submit/${attemptId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) throw new Error('Failed to submit attempt')
  return res.json()
}

export async function getLeaderboard(token, quizId, limit = 10) {
  const res = await fetch(`${API_URL}/attempts/leaderboard/${quizId}?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return res.json()
}

export async function getMyHistory(token) {
  const res = await fetch(`${API_URL}/attempts/me/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function getAttemptById(token, attemptId) {
  const res = await fetch(`${API_URL}/attempts/${attemptId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch attempt details')
  return res.json()
}
