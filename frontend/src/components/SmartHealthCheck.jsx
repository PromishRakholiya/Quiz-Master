import React from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Global state to track API health across components
let globalApiStatus = 'unknown'
let lastApiError = null
let apiErrorCount = 0

export default function SmartHealthCheck() {
  const [showError, setShowError] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    // Listen for API errors from other parts of the app
    const handleApiError = (event) => {
      const { error, url } = event.detail
      
      // Only show if it's a fetch error to our API
      if (url && url.includes(API_URL)) {
        apiErrorCount++
        lastApiError = error
        globalApiStatus = 'error'
        
        // Only show after multiple consecutive failures
        if (apiErrorCount >= 2 && !dismissed) {
          setShowError(true)
        }
      }
    }

    const handleApiSuccess = () => {
      apiErrorCount = 0
      globalApiStatus = 'connected'
      setShowError(false)
      setDismissed(false)
    }

    // Listen for custom events
    window.addEventListener('api-error', handleApiError)
    window.addEventListener('api-success', handleApiSuccess)

    return () => {
      window.removeEventListener('api-error', handleApiError)
      window.removeEventListener('api-success', handleApiSuccess)
    }
  }, [dismissed])

  const handleRetry = async () => {
    try {
      const res = await fetch(`${API_URL}/health`)
      if (res.ok) {
        apiErrorCount = 0
        globalApiStatus = 'connected'
        setShowError(false)
        setDismissed(false)
        // Trigger success event
        window.dispatchEvent(new CustomEvent('api-success'))
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (err) {
      console.warn('Health check retry failed:', err.message)
    }
  }

  if (!showError || dismissed) return null

  return (
    <div className="card p-3 mb-4 bg-red-50 border-red-200">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          ❌ API Connection Issues Detected
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="text-xs btn btn-primary"
            onClick={handleRetry}
          >
            🔄 Test Connection
          </button>
          <button 
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-600 mt-2">
        <div className="mb-2">
          Multiple API requests have failed. This usually means the backend server is not running.
        </div>
        <div className="space-y-1">
          <div><strong>Quick fixes:</strong></div>
          <div>1. Make sure backend is running: <code className="bg-gray-100 px-1 rounded">cd backend && npm start</code></div>
          <div>2. Check API health: <a href="http://localhost:5000/api/health" target="_blank" className="text-blue-600 underline">http://localhost:5000/api/health</a></div>
          <div>3. Restart frontend if needed: <code className="bg-gray-100 px-1 rounded">cd frontend && npm run dev</code></div>
        </div>
      </div>
    </div>
  )
}

// Utility function to report API errors from other components
export const reportApiError = (error, url) => {
  window.dispatchEvent(new CustomEvent('api-error', { 
    detail: { error: error.message, url } 
  }))
}

// Utility function to report API success from other components
export const reportApiSuccess = () => {
  window.dispatchEvent(new CustomEvent('api-success'))
}
