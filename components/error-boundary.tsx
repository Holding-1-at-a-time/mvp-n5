"use client"

import React from "react"
import { ErrorLogger, createAppError } from "@/lib/error-handling"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { toast } from "sonner"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorId: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = createAppError(error)
    const errorId = this.state.errorId || "unknown"

    ErrorLogger.log(appError, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })

    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorId={this.state.errorId || "unknown"}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError, errorId }: ErrorFallbackProps) {
  const copyErrorDetails = () => {
    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
    toast.success("Error details copied to clipboard")
  }

  const reportError = () => {
    // In a real app, this would send to your error reporting service
    toast.success("Error reported to support team")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>We're sorry, but something unexpected happened. Our team has been notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-sm font-mono text-gray-700 break-all">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyErrorDetails} className="flex-1 bg-transparent">
                <Bug className="w-4 h-4 mr-2" />
                Copy Details
              </Button>
              <Button variant="outline" size="sm" onClick={reportError} className="flex-1 bg-transparent">
                Report Issue
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">Error ID: {errorId}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized error boundaries for different contexts
export function APIErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError, errorId }) => (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-medium text-red-800">API Error</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">Failed to load data. Please check your connection and try again.</p>
          <Button size="sm" onClick={resetError}>
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-medium text-red-800">Form Error</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">There was an error with the form. Please refresh and try again.</p>
          <Button size="sm" onClick={resetError}>
            Reset Form
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
