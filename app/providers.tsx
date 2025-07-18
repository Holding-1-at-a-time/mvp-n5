"use client"

import type React from "react"

import { ConvexReactClient } from "convex/react"
import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { env, validateEnv } from "@/lib/env"
import { useEffect, useState } from "react"

// Create Convex client
const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isValidated, setIsValidated] = useState(false)

  useEffect(() => {
    // Validate environment variables on client side
    const isValid = validateEnv()
    if (!isValid) {
      console.warn("Some environment variables are missing. Check your .env.local file.")
    }
    setIsValidated(true)
  }, [])

  if (!isValidated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">Initializing application</p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider
      publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#000000",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

// Back-compat: some modules still import { Providers }
export { ConvexClientProvider as Providers }
