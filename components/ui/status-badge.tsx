import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "complete" | "pending" | "processing" | "failed" | "ai-powered"
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const variants = {
    complete: {
      className: "bg-green-500/20 text-green-400 border border-green-500/30",
      icon: CheckCircle,
      label: "Completed",
    },
    pending: {
      className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      icon: Clock,
      label: "Pending",
    },
    processing: {
      className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      icon: Clock,
      label: "Processing",
    },
    failed: {
      className: "bg-red-500/20 text-red-400 border border-red-500/30",
      icon: XCircle,
      label: "Failed",
    },
    "ai-powered": {
      className: "bg-[#00ae98]/20 text-[#00ae98] border border-[#00ae98]/30",
      icon: Sparkles,
      label: "AI-Powered",
    },
  }

  const variant = variants[status]
  const Icon = variant.icon

  return (
    <Badge className={cn(variant.className, className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {variant.label}
    </Badge>
  )
}
