import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ApiHealthCheck from '../components/ApiHealthCheck.jsx'

export default function Login({ expectedRole = 'student' }) {
  const { login } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const title = expectedRole === 'admin' ? 'Admin Login' : 'Student Login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      // After login, enforce role if this is role-specific page
      if (res && res.user && res.user.role && expectedRole && res.user.role !== expectedRole) {
        setError(`This account is for ${res.user.role}. Please use the correct login page.`)
        return
      }
      // Redirect based on role
      if (expectedRole === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="page-title mb-1">{title}</h1>
        <p className="form-hint mb-4">Enter your credentials to continue.</p>
        {error && <div className="form-error mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" required />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      </div>
    </div>
  )
}
