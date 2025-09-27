import React, { createContext, useContext, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  useEffect(() => {
    if (token && !user) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setUser(data.user))
        .catch((err) => {
          console.warn('Failed to fetch user profile:', err)
          // Do not immediately logout on transient failure; keep token so UI can retry
          // You can manually logout if token is invalid
        })
    }
  }, [token])

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      let msg = 'Invalid credentials'
      try {
        const dataErr = await res.json()
        msg = dataErr?.message || msg
      } catch {}
      throw new Error(msg)
    }
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    return data
  }

  const register = async (payload) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let msg = 'Registration failed'
      try {
        const dataErr = await res.json()
        if (dataErr?.errors?.length) {
          msg = dataErr.errors.map(e => e.msg).join(', ')
        } else if (dataErr?.message) {
          msg = dataErr.message
        }
      } catch {}
      throw new Error(msg)
    }
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    return data
  }

  const logout = (notifyServer = true) => {
    if (notifyServer && token) {
      fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{})
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const fetchMe = async () => {
    if (!token) return null
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to load profile')
    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const updateProfile = async (updates) => {
    if (!token) throw new Error('Not authenticated')
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update profile')
    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated')
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!res.ok) throw new Error('Failed to change password')
    return await res.json()
  }

  const value = { user, token, login, register, logout, fetchMe, updateProfile, changePassword }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
