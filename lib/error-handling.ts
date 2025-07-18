import * as Sentry from "@sentry/nextjs"
import { toast } from "sonner"

// Error types for better categorization
export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  CONVEX = "CONVEX",
  AI_PROCESSING = "AI_PROCESSING",
  FILE_UPLOAD = "FILE_UPLOAD",
  UNKNOWN = "UNKNOWN",
}

export interface AppError extends Error {
  type: ErrorType
  code?: string
  statusCode?: number
  context?: Record<string, any>
  userMessage?: string
  retryable?: boolean
}

// Create typed error classes
export class NetworkError extends Error implements AppError {
  type = ErrorType.NETWORK as const
  retryable = true

  constructor(
    message: string,
    public statusCode?: number,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "NetworkError"
    this.userMessage = "Network connection failed. Please check your internet connection and try again."
  }
}

export class ValidationError extends Error implements AppError {
  type = ErrorType.VALIDATION as const
  retryable = false

  constructor(
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "ValidationError"
    this.userMessage = "Please check your input and try again."
  }
}

export class AuthenticationError extends Error implements AppError {
  type = ErrorType.AUTHENTICATION as const
  retryable = false

  constructor(message = "Authentication required") {
    super(message)
    this.name = "AuthenticationError"
    this.userMessage = "Please sign in to continue."
  }
}

export class AuthorizationError extends Error implements AppError {
  type = ErrorType.AUTHORIZATION as const
  retryable = false

  constructor(message = "Access denied") {
    super(message)
    this.name = "AuthorizationError"
    this.userMessage = "You do not have permission to perform this action."
  }
}

export class ConvexError extends Error implements AppError {
  type = ErrorType.CONVEX as const
  retryable = true

  constructor(
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "ConvexError"
    this.userMessage = "Database operation failed. Please try again."
  }
}

export class AIProcessingError extends Error implements AppError {
  type = ErrorType.AI_PROCESSING as const
  retryable = true

  constructor(
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "AIProcessingError"
    this.userMessage = "AI processing failed. Please try again or contact support."
  }
}

export class FileUploadError extends Error implements AppError {
  type = ErrorType.FILE_UPLOAD as const
  retryable = true

  constructor(
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "FileUploadError"
    this.userMessage = "File upload failed. Please check the file and try again."
  }
}

// Error logging utility
export class ErrorLogger {
  static log(error: Error | AppError, context?: Record<string, any>) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        ...(error as AppError).context,
      },
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("🚨 Error logged:", errorData)
    }

    // Send to Sentry in production
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, {
        tags: {
          errorType: (error as AppError).type || ErrorType.UNKNOWN,
          retryable: (error as AppError).retryable?.toString() || "unknown",
        },
        extra: errorData.context,
      })
    }

    // Store in local storage for debugging (last 10 errors)
    try {
      const storedErrors = JSON.parse(localStorage.getItem("app_errors") || "[]")
      storedErrors.unshift(errorData)
      localStorage.setItem("app_errors", JSON.stringify(storedErrors.slice(0, 10)))
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  static getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem("app_errors") || "[]")
    } catch {
      return []
    }
  }

  static clearStoredErrors() {
    try {
      localStorage.removeItem("app_errors")
    } catch {
      // Ignore localStorage errors
    }
  }
}

// Error boundary hook
export function useErrorHandler() {
  const handleError = (error: Error | AppError, context?: Record<string, any>) => {
    ErrorLogger.log(error, context)

    const appError = error as AppError
    const userMessage = appError.userMessage || "An unexpected error occurred. Please try again."

    // Show user-friendly toast notification
    toast.error(userMessage, {
      description: process.env.NODE_ENV === "development" ? error.message : undefined,
      action: appError.retryable
        ? {
            label: "Retry",
            onClick: () => window.location.reload(),
          }
        : undefined,
    })
  }

  return { handleError }
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>,
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const appError = createAppError(error)
    ErrorLogger.log(appError, context)
    throw appError
  }
}

// Convert unknown errors to AppError
export function createAppError(error: unknown): AppError {
  if (error instanceof Error && "type" in error) {
    return error as AppError
  }

  if (error instanceof Error) {
    // Try to categorize based on error message
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new NetworkError(error.message)
    }
    if (error.message.includes("validation") || error.message.includes("invalid")) {
      return new ValidationError(error.message)
    }
    if (error.message.includes("unauthorized") || error.message.includes("authentication")) {
      return new AuthenticationError(error.message)
    }
    if (error.message.includes("forbidden") || error.message.includes("permission")) {
      return new AuthorizationError(error.message)
    }

    // Generic server error
    const serverError = new Error(error.message) as AppError
    serverError.type = ErrorType.SERVER
    serverError.userMessage = "A server error occurred. Please try again."
    return serverError
  }

  // Unknown error type
  const unknownError = new Error(String(error)) as AppError
  unknownError.type = ErrorType.UNKNOWN
  unknownError.userMessage = "An unexpected error occurred. Please try again."
  return unknownError
}

// Retry utility for retryable operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
  context?: Record<string, any>,
): Promise<T> {
  let lastError: AppError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = createAppError(error)

      if (!lastError.retryable || attempt === maxRetries) {
        ErrorLogger.log(lastError, { ...context, attempt, maxRetries })
        throw lastError
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}
