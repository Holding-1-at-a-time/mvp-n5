"use client"

import type React from "react"

import { cn } from "@/lib/utils"

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md", className, ...props }: LogoProps) {
  const dim = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-16 h-16" : "w-12 h-12"

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div
        className={cn(
          dim,
          "bg-gradient-to-br from-[#00ae98] to-[#00ae98]/80 rounded-xl flex items-center justify-center",
        )}
      >
        <span className="text-white font-bold text-sm md:text-lg">SS</span>
      </div>
      {size !== "sm" && (
        <div>
          <h1 className="font-bold text-white text-lg md:text-xl">Slick Solutions</h1>
          <p className="text-xs text-slate-400 hidden md:block">AI-Powered Detailing</p>
        </div>
      )}
    </div>
  )
}
