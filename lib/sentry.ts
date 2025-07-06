import * as Sentry from "@sentry/nextjs"

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error) {
          // Skip network timeout errors in development
          if (process.env.NODE_ENV === "development" && error.message.includes("timeout")) {
            return null
          }
        }
      }
      return event
    },

    // Custom tags for all events
    initialScope: {
      tags: {
        component: "vehicle-inspection-system",
        version: process.env.npm_package_version || "1.0.0",
      },
    },
  })
}

// Server action error wrapper
export function withSentryServerAction<T extends any[], R>(actionName: string, action: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    return Sentry.withScope(async (scope) => {
      scope.setTag("action", actionName)
      scope.setContext("server_action", {
        name: actionName,
        args: args.length,
      })

      try {
        const result = await action(...args)

        // Log successful action
        Sentry.addBreadcrumb({
          category: "server_action",
          message: `${actionName} completed successfully`,
          level: "info",
        })

        return result
      } catch (error) {
        // Capture server action errors with context
        Sentry.captureException(error, {
          tags: {
            server_action: actionName,
          },
          extra: {
            actionName,
            argsCount: args.length,
          },
        })

        throw error
      }
    })
  }
}

// API route error wrapper
export function withSentryApiRoute<T>(routeName: string, handler: (req: Request) => Promise<T>) {
  return async (req: Request): Promise<T> => {
    return Sentry.withScope(async (scope) => {
      scope.setTag("api_route", routeName)
      scope.setContext("api_request", {
        route: routeName,
        method: req.method,
        url: req.url,
      })

      try {
        const result = await handler(req)

        Sentry.addBreadcrumb({
          category: "api_route",
          message: `${routeName} ${req.method} completed`,
          level: "info",
        })

        return result
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            api_route: routeName,
            method: req.method,
          },
          extra: {
            routeName,
            method: req.method,
            url: req.url,
          },
        })

        throw error
      }
    })
  }
}
