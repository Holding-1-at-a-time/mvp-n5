"use client"

import { cn } from "@/lib/utils"

type LogoProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * Branded “Slick Solutions” logo.
 * Usage: <Logo /> or <Logo size="sm" />
 */
export function Logo({ size = "md", className }: LogoProps) {
  const dimension = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-12 w-12"
  const titleSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl"
  const subtitleSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          dimension,
          "bg-gradient-to-br from-[#00ae98] to-[#00ae98]/80 rounded-xl flex items-center justify-center",
        )}
      >
        <span className="text-white font-bold">SS</span>
      </div>
      <div className="leading-none">
        <h1 className={cn(titleSize, "font-bold text-white")}>Slick Solutions</h1>
        <p className={cn(subtitleSize, "text-slate-400")}>AI-Powered Detailing</p>
      </div>
    </div>
  )
}
