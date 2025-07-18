"use client"

import type { ReactNode } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  // Helpful early error if the env var isn’t configured
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL")
}
const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </ConvexProvider>
    </ClerkProvider>
  )
}

/**
 * Legacy re-export for code that still imports `{ Providers }`.
 * Prefer `ConvexClientProvider` going forward.
 */
export { ConvexClientProvider as Providers }
