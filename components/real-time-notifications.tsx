"use client"

import { useState, useEffect } from "react"
import { useSubscription } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"

interface RealTimeNotificationsProps {
  shopId: Id<"shops">
}

export function RealTimeNotifications({ shopId }: RealTimeNotificationsProps) {
  const { toast } = useToast()
  const [lastInspectionCount, setLastInspectionCount] = useState<number | null>(null)

  // Subscribe to dashboard stats
  const stats = useSubscription(api.components.subscribeToDashboardStats, { shopId })

  // Show toast notification when inspection count changes
  useEffect(() => {
    if (stats && lastInspectionCount !== null && stats.totalInspections !== lastInspectionCount) {
      // If count increased
      if (stats.totalInspections > lastInspectionCount) {
        toast({
          title: "New inspection created",
          description: `A new inspection has been added. Total: ${stats.totalInspections}`,
          duration: 5000,
        })
      }
      // If count decreased
      else if (stats.totalInspections < lastInspectionCount) {
        toast({
          title: "Inspection removed",
          description: `An inspection has been removed. Total: ${stats.totalInspections}`,
          duration: 5000,
        })
      }
    }

    // Update last count
    if (stats) {
      setLastInspectionCount(stats.totalInspections)
    }
  }, [stats, lastInspectionCount, toast])

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {stats?.pendingInspections > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {stats.pendingInspections}
        </span>
      )}
    </div>
  )
}
