"use client"

import { type ReactNode, useMemo } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ClerkProvider } from "@clerk/nextjs"

/**
 * Wraps the React tree with Convex context.
 * Reads the URL from NEXT_PUBLIC_CONVEX_URL.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!), [])

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ClerkProvider>
  )
}

/* -------------------------------------------------------------------------- */
/* Legacy alias so older imports (`Providers`) keep working.                  */
/* -------------------------------------------------------------------------- */
export { ConvexClientProvider as Providers }
export default ConvexClientProvider
