import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user, fetchMe, updateProfile, changePassword } = useAuth()
  const [profile, setProfile] = React.useState({ username: '', firstName: '', lastName: '', email: '', profilePicture: '' })
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState('')

  const [pwd, setPwd] = React.useState({ currentPassword: '', newPassword: '' })
  const [pwdMsg, setPwdMsg] = React.useState('')
  const [pwdErr, setPwdErr] = React.useState('')

  React.useEffect(() => {
    // Load latest profile
    fetchMe().then(u => {
      if (u) setProfile({ username: u.username || '', firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', profilePicture: u.profilePicture || '' })
    }).catch(()=>{})
  }, [])

  const onChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateProfile({ username: profile.username, firstName: profile.firstName, lastName: profile.lastName, profilePicture: profile.profilePicture })
      setMessage('Profile updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const onPickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Convert to data URL for simplicity; can be replaced with real upload later
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result
      setProfile(p => ({ ...p, profilePicture: dataUrl }))
      try {
        await updateProfile({ profilePicture: dataUrl })
        setMessage('Photo updated')
      } catch (err) {
        setError(err.message || 'Failed to update photo')
      }
    }
    reader.readAsDataURL(file)
  }

  const onChangePwd = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    setPwdErr('')
    try {
      await changePassword(pwd.currentPassword, pwd.newPassword)
      setPwdMsg('Password changed successfully')
      setPwd({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPwdErr(err.message || 'Failed to change password')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <img src={profile.profilePicture} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
          <div>
            <h1 className="page-title">{profile.firstName} {profile.lastName}</h1>
            <div className="text-sm text-gray-600">@{profile.username}</div>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Change photo</label>
          <input type="file" accept="image/*" onChange={onPickImage} className="block" />
          <p className="form-hint mt-1">You can upload a new profile photo. PNG/JPG recommended.</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={profile.email} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">First name</label>
              <input name="firstName" value={profile.firstName} onChange={onChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Last name</label>
              <input name="lastName" value={profile.lastName} onChange={onChange} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input name="username" value={profile.username} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={onChangePwd} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Current password</label>
            <input type="password" value={pwd.currentPassword} onChange={e=>setPwd({ ...pwd, currentPassword: e.target.value })} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input type="password" value={pwd.newPassword} onChange={e=>setPwd({ ...pwd, newPassword: e.target.value })} className="w-full border rounded px-3 py-2" required minLength={6} />
          </div>
          {pwdErr && <div className="text-red-600 text-sm">{pwdErr}</div>}
          {pwdMsg && <div className="text-green-600 text-sm">{pwdMsg}</div>}
          <button className="btn btn-secondary">Update password</button>
        </form>
      </div>
    </div>
  )
}
