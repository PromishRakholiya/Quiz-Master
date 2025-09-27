import React from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ApiHealthCheck({ showOnlyOnError = true, autoCheck = false }) {
  const [status, setStatus] = React.useState('connected') // Start optimistic
  const [message, setMessage] = React.useState('')
  const [showBanner, setShowBanner] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const [dismissed, setDismissed] = React.useState(false)
  const [lastSuccessTime, setLastSuccessTime] = React.useState(Date.now())

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const res = await fetch(`${API_URL}/health`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (res.ok) {
          const data = await res.json()
          setStatus('connected')
          setMessage(`✅ API Connected: ${data.message}`)
          setShowBanner(false)
          setRetryCount(0)
          setLastSuccessTime(Date.now())
          setDismissed(false) // Reset dismissed state on success
          console.log('🔗 API Health Check: Connected successfully')
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
      } catch (err) {
        // Only show error if it's been more than 10 seconds since last success
        const timeSinceLastSuccess = Date.now() - lastSuccessTime
        if (timeSinceLastSuccess > 10000) {
          setStatus('error')
          if (err.name === 'AbortError') {
            setMessage(`❌ Connection Timeout: API not responding`)
          } else {
            setMessage(`❌ Connection Failed: ${err.message}`)
          }
          setShowBanner(true)
          setRetryCount(prev => prev + 1)
          console.warn('🔗 API Health Check: Failed -', err.message)
        } else {
          // Transient error - don't show banner yet
          console.log('🔗 API Health Check: Transient error, not showing banner yet')
        }
      }
    }
    
    // Only run health check if autoCheck is enabled or if there's an error
    if (autoCheck || status === 'error') {
      // Initial check only if autoCheck is enabled
      if (autoCheck) {
        checkHealth()
      }
      
      // Auto-retry logic with exponential backoff - only for persistent errors
      if (status === 'error' && retryCount < 5 && !dismissed) {
        const delay = Math.min(3000 * Math.pow(1.5, retryCount), 30000) // Max 30 seconds
        const timer = setTimeout(checkHealth, delay)
        return () => clearTimeout(timer)
      }
    }
  }, [status, retryCount, dismissed, autoCheck])

  // Only show banner if there's an error and showOnlyOnError is true
  if (showOnlyOnError && status === 'connected') return null
  if (showOnlyOnError && !showBanner) return null

  return (
    <div className={`card p-3 mb-4 ${status === 'error' ? 'bg-red-50 border-red-200' : status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {status === 'checking' ? '🔄 Checking API connection...' : message}
        </div>
        {status === 'error' && (
          <div className="flex items-center gap-2">
            <button 
              className="text-xs btn btn-primary"
              onClick={() => {
                setRetryCount(0)
                setStatus('checking')
                setShowBanner(false)
              }}
            >
              🔄 Retry
            </button>
            <button 
              onClick={() => {
                setDismissed(true)
                setShowBanner(false)
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}
      </div>
      {status === 'error' && showBanner && !dismissed && (
        <div className="text-xs text-gray-600 mt-2">
          <div className="mb-2">
            <strong>🔧 Auto-Fix Available:</strong> 
            <button 
              className="ml-2 text-blue-600 underline hover:text-blue-800"
              onClick={() => {
                // Open the fix script
                const link = document.createElement('a')
                link.href = '/fix-connection-permanently.bat'
                link.download = 'fix-connection-permanently.bat'
                link.click()
              }}
            >
              Download Fix Script
            </button>
          </div>
          <div className="space-y-1">
            <div><strong>Manual Fix:</strong></div>
            <div>1. Create <code className="bg-gray-100 px-1 rounded">frontend/.env</code> with: <code className="bg-gray-100 px-1 rounded">VITE_API_URL=http://localhost:5000/api</code></div>
            <div>2. Start backend: <code className="bg-gray-100 px-1 rounded">cd backend && npm start</code></div>
            <div>3. Restart frontend: <code className="bg-gray-100 px-1 rounded">cd frontend && npm run dev</code></div>
          </div>
        </div>
      )}
    </div>
  )
}
