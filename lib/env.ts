// Environment configuration with validation
export const env = {
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const

// Validation function for required environment variables
export function validateEnv() {
  const requiredVars = ["NEXT_PUBLIC_CONVEX_URL"] as const

  const missing = requiredVars.filter((key) => !env[key])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

// Check if we're in development mode
export const isDev = process.env.NODE_ENV === "development"
export const isProd = process.env.NODE_ENV === "production"
