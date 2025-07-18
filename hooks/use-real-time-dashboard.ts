import { useQuery, useSubscription } from "convex/react"
import { api } from "../convex/_generated/api"
import type { Id } from "../convex/_generated/dataModel"

export function useRealTimeDashboardStats(shopId: Id<"shops">) {
  // Use subscription for real-time updates
  const stats = useSubscription(api.components.subscribeToDashboardStats, { shopId })

  // Fallback to query if subscription is not ready yet
  const fallbackStats = useQuery(api.components.getDashboardStats, { shopId })

  // Return subscription data if available, otherwise fallback to query data
  return stats || fallbackStats
}

export function useRealTimeRecentActivity(shopId: Id<"shops">, limit = 10) {
  // Use subscription for real-time updates
  const activity = useSubscription(api.components.subscribeToRecentActivity, { shopId, limit })

  // Fallback to query if subscription is not ready yet
  const fallbackActivity = useQuery(api.components.getRecentActivity, { shopId, limit })

  // Return subscription data if available, otherwise fallback to query data
  return activity || fallbackActivity
}

export function useRealTimeSystemHealth(shopId: Id<"shops">) {
  // Use subscription for real-time updates
  const health = useSubscription(api.components.subscribeToSystemHealth, { shopId })

  // Fallback to query if subscription is not ready yet
  const fallbackHealth = useQuery(api.components.getSystemHealth, { shopId })

  // Return subscription data if available, otherwise fallback to query data
  return health || fallbackHealth
}

export function useRealTimeComponentAnalytics(shopId: Id<"shops">, timeRange: "7d" | "30d" | "90d" = "30d") {
  // Use subscription for real-time updates
  const analytics = useSubscription(api.components.subscribeToComponentAnalytics, { shopId, timeRange })

  // Fallback to query if subscription is not ready yet
  const fallbackAnalytics = useQuery(api.components.getComponentAnalytics, { shopId, timeRange })

  // Return subscription data if available, otherwise fallback to query data
  return analytics || fallbackAnalytics
}
