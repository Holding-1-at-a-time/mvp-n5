"use client"

import { useMemo, type ReactNode } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

/**
 * Returns a ClerkProvider when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set,
 * otherwise falls back to a no-op wrapper so build-time prerendering works
 * even without the env var (e.g. preview deployments or OSS forks).
 */
function MaybeClerk({ children }: { children: ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return key ? <ClerkProvider publishableKey={key}>{children}</ClerkProvider> : <>{children}</>
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!), [])

  return (
    <MaybeClerk>
      <ConvexProvider client={convex}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </ConvexProvider>
    </MaybeClerk>
  )
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                     */
/* -------------------------------------------------------------------------- */
export { ConvexClientProvider as Providers } // legacy alias
export default ConvexClientProvider // default export required by build
