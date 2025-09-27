import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-6 m-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong!</h2>
          <div className="space-y-3">
            <p className="text-gray-600">The application encountered an error and couldn't render this page.</p>
            
            <details className="bg-gray-50 p-4 rounded">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <div className="mt-2 text-sm">
                <div className="font-medium text-red-600">{this.state.error && this.state.error.toString()}</div>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>

            <div className="flex gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
