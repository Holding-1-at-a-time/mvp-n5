import { ConvexReactClient } from "convex/react"
import { env } from "./env"

// Create Convex client with proper error handling
export const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL, {
  // Enable verbose logging in development
  verbose: process.env.NODE_ENV === "development",
})

// Helper function to check if Convex is properly configured
export function isConvexConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_CONVEX_URL && env.NEXT_PUBLIC_CONVEX_URL !== "")
}

// Helper function to get Convex deployment URL
export function getConvexUrl(): string {
  return env.NEXT_PUBLIC_CONVEX_URL
}

// Development helper to check connection status
export async function checkConvexConnection(): Promise<boolean> {
  if (!isConvexConfigured()) {
    console.warn("Convex is not configured. Please set NEXT_PUBLIC_CONVEX_URL")
    return false
  }

  try {
    // Try to make a simple query to test connection
    // This will throw if Convex is not running
    await convex.query("shops.list" as any)
    return true
  } catch (error) {
    console.warn("Convex connection failed:", error)
    return false
  }
}
