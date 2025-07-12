"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  /** Currently only used for subscription status but kept generic */
  status?: "active" | "trialing" | "past_due" | "canceled" | string
  type?: "subscription" | "generic"
}

/** Color-coded badge for subscription (or generic) statuses. */
export function StatusBadge({ status, type = "generic", className, ...props }: StatusBadgeProps) {
  const palette =
    type === "subscription"
      ? {
          active: "bg-green-500/20 text-green-400 border border-green-500/30",
          trialing: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
          past_due: "bg-red-500/20 text-red-400 border border-red-500/30",
          canceled: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
        }
      : {}

  return (
    <Badge className={cn("capitalize", status ? palette[status] : "", className)} {...props}>
      {status ?? "unknown"}
    </Badge>
  )
}
