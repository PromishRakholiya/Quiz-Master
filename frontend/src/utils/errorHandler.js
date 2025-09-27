// Centralized error handling utilities

export const parseApiError = (error, fallbackMessage = 'An error occurred') => {
  if (typeof error === 'string') return error
  
  // Network/fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Unable to connect to server. Please check your internet connection.'
  }
  
  // API response errors
  if (error.response) {
    const { status, data } = error.response
    if (data?.errors?.length) {
      return data.errors.map(e => e.msg).join(', ')
    }
    if (data?.message) return data.message
    
    // HTTP status code messages
    switch (status) {
      case 400: return 'Invalid request. Please check your input.'
      case 401: return 'Please log in to continue.'
      case 403: return 'You do not have permission to perform this action.'
      case 404: return 'The requested resource was not found.'
      case 409: return 'This action conflicts with existing data.'
      case 422: return 'The submitted data is invalid.'
      case 500: return 'Server error. Please try again later.'
      default: return `Server error (${status}). Please try again.`
    }
  }
  
  return error.message || fallbackMessage
}

export const handleAuthError = (error) => {
  const message = parseApiError(error, 'Authentication failed')
  
  // Auto-redirect on auth errors
  if (message.includes('log in') || message.includes('token') || message.includes('unauthorized')) {
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }
  
  return message
}

export const showErrorDetails = (error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Detailed error:', error)
  }
  return parseApiError(error)
}
