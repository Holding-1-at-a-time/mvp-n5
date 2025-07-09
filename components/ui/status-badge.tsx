import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "active" | "inactive" | "completed" | "inProgress" | "pending" | "error"

interface StatusBadgeProps {
  status: Status
  className?: string
  type?: "inspection" | "subscription"
}

export function StatusBadge({ status, className, type = "subscription" }: StatusBadgeProps) {
  let colorClasses = ""
  let icon = null

  switch (status) {
    case "active":
    case "completed":
      colorClasses = "bg-green-500/20 text-green-400 border border-green-500/30"
      icon = <CheckCircle className="h-3 w-3 mr-1" />
      break
    case "inProgress":
    case "pending":
      colorClasses = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
      icon = <Clock className="h-3 w-3 mr-1" />
      break
    default:
      colorClasses = "bg-red-500/20 text-red-400 border border-red-500/30"
      icon = <XCircle className="h-3 w-3 mr-1" />
  }

  const label =
    type === "inspection"
      ? status === "completed"
        ? "Completed"
        : status === "inProgress"
          ? "In Progress"
          : "Pending"
      : status === "active"
        ? "Active"
        : "Inactive"

  return (
    <Badge className={cn(colorClasses, "flex items-center", className)}>
      {icon}
      {label}
    </Badge>
  )
}
