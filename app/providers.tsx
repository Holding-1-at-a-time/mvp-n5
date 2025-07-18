"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "next-themes"
import type React from "react"

import { env } from "@/lib/env"

/* ------------------------------------------------------------------
 * Convex client
 * ----------------------------------------------------------------*/
const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL ?? "")

/* ------------------------------------------------------------------
 * Safe Clerk wrapper – only mounts if a publishable key is configured
 * ----------------------------------------------------------------*/
function MaybeClerk({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return key ? <ClerkProvider publishableKey={key}>{children}</ClerkProvider> : <>{children}</>
}

/* ------------------------------------------------------------------
 * Main provider exported both as named & default (for legacy imports)
 * ----------------------------------------------------------------*/
export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <MaybeClerk>
      <ConvexProvider client={convex}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </ConvexProvider>
    </MaybeClerk>
  )
}

export default ConvexClientProvider
