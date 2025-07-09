import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, XCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  type?: "inspection" | "customer" | "vehicle" | "general"
  className?: string
}

export function StatusBadge({ status, type = "general", className }: StatusBadgeProps) {
  const getStatusConfig = (status: string, type: string) => {
    const configs = {
      inspection: {
        scheduled: {
          icon: Clock,
          className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        },
        "in-progress": {
          icon: Clock,
          className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        },
        completed: {
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-400 border border-green-500/30",
        },
        cancelled: {
          icon: XCircle,
          className: "bg-red-500/20 text-red-400 border border-red-500/30",
        },
      },
      customer: {
        active: {
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-400 border border-green-500/30",
        },
        inactive: {
          icon: XCircle,
          className: "bg-red-500/20 text-red-400 border border-red-500/30",
        },
      },
      vehicle: {
        active: {
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-400 border border-green-500/30",
        },
        inactive: {
          icon: XCircle,
          className: "bg-red-500/20 text-red-400 border border-red-500/30",
        },
      },
      general: {
        active: {
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-400 border border-green-500/30",
        },
        pending: {
          icon: Clock,
          className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        },
        "ai-powered": {
          icon: Sparkles,
          className: "bg-[#00ae98]/20 text-[#00ae98] border border-[#00ae98]/30",
        },
      },
    }

    return (
      configs[type as keyof typeof configs]?.[status] || {
        icon: AlertCircle,
        className: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
      }
    )
  }

  const config = getStatusConfig(status, type)
  const Icon = config.icon

  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </Badge>
  )
}
