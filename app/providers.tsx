"use client"

import { type ReactNode, useMemo } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"

/**
 * Wraps the React tree with Convex context.
 * Reads the URL from NEXT_PUBLIC_CONVEX_URL.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!), [])

  return (
    <ConvexProvider client={convex} useSuspense>
      {children}
    </ConvexProvider>
  )
}

/* -------------------------------------------------------------------------- */
/* Legacy alias so older imports (`Providers`) keep working.                  */
/* -------------------------------------------------------------------------- */
export { ConvexClientProvider as Providers }
export default ConvexClientProvider
