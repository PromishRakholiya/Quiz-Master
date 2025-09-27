import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ApiHealthCheck from '../components/ApiHealthCheck.jsx'

export default function Signup({ roleDefault = 'student' }) {
  const { register } = useAuth()
  const [form, setForm] = React.useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: roleDefault
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      // Redirect based on role
      if (form.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="page-title mb-1">Create your account</h1>
        <p className="form-hint mb-4">Join as a student or admin.</p>
        {error && <div className="form-error mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">I am a</label>
          <select name="role" value={form.role} onChange={onChange} className="select">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First name</label>
            <input name="firstName" value={form.firstName} onChange={onChange} className="input" required />
          </div>
          <div>
            <label className="label">Last name</label>
            <input name="lastName" value={form.lastName} onChange={onChange} className="input" required />
          </div>
        </div>
        <div>
          <label className="label">Username</label>
          <input name="username" value={form.username} onChange={onChange} className="input" required minLength={3} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="input" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="input" required minLength={6} />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
      </form>
      </div>
    </div>
  )
}
