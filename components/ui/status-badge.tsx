"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Sparkles, PauseCircle } from "lucide-react"

type Props = {
  status: "active" | "suspended" | "trial" | "ai-powered"
  className?: string
}

/**
 * Re-usable status badge component.
 */
export function StatusBadge({ status, className }: Props) {
  const base = "flex items-center gap-1 border px-2 py-0.5 rounded-md text-xs font-medium select-none"

  const map = {
    active: {
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: CheckCircle,
      label: "Active",
    },
    suspended: {
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: PauseCircle,
      label: "Suspended",
    },
    trial: {
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: Sparkles,
      label: "Trial",
    },
    "ai-powered": {
      color: "bg-[#00ae98]/20 text-[#00ae98] border-[#00ae98]/30",
      icon: Sparkles,
      label: "AI-Powered",
    },
  } as const

  const { color, icon: Icon, label } = map[status]

  return (
    <Badge className={cn(base, color, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
