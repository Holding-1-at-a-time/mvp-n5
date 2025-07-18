"use client"

import * as React from "react"

/**
 * Minimal context used by shadcn/ui chart primitives.
 * Extend as needed to provide theming or shared scales.
 */
export type ChartContextValue = Record<string, unknown>

export const ChartContext = React.createContext<ChartContextValue | null>(null)

export function ChartProvider({
  value,
  children,
}: {
  value: ChartContextValue
  children: React.ReactNode
}) {
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
}

/** Helper hook – returns non-null context or throws. */
export function useChartContext() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChartContext must be used inside <ChartProvider>")
  return ctx
}
