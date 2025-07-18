import { query, mutation, subscription } from "./_generated/server"
import { v } from "convex/values"

/**
 * Component-related Convex functions for the vehicle inspection system.
 * These handle UI state, preferences, and component-specific data.
 */

// Query to get dashboard statistics for a shop
export const getDashboardStats = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, { shopId }) => {
    // Get total inspections
    const totalInspections = await ctx.db
      .query("inspections")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()

    // Get pending inspections
    const pendingInspections = await ctx.db
      .query("inspections")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.eq(q.field("status"), "pending")))
      .collect()

    // Get completed inspections this month
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentInspections = await ctx.db
      .query("inspections")
      .filter((q) =>
        q.and(
          q.eq(q.field("shopId"), shopId),
          q.eq(q.field("status"), "complete"),
          q.gte(q.field("completedAt"), thirtyDaysAgo),
        ),
      )
      .collect()

    // Calculate total revenue from completed inspections
    const totalRevenue = recentInspections.reduce((sum, inspection) => {
      return sum + (inspection.estimatedCost || 0)
    }, 0)

    // Get active customers
    const activeCustomers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()

    return {
      totalInspections: totalInspections.length,
      pendingInspections: pendingInspections.length,
      completedThisMonth: recentInspections.length,
      totalRevenue,
      activeCustomers: activeCustomers.length,
    }
  },
})

// Real-time subscription for dashboard statistics
export const subscribeToDashboardStats = subscription({
  args: { shopId: v.id("shops") },
  handler: async (ctx, { shopId }) => {
    // Watch for changes in inspections and customers tables
    ctx.db
      .query("inspections")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()
    ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()

    // Get total inspections
    const totalInspections = await ctx.db
      .query("inspections")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()

    // Get pending inspections
    const pendingInspections = await ctx.db
      .query("inspections")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.eq(q.field("status"), "pending")))
      .collect()

    // Get completed inspections this month
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentInspections = await ctx.db
      .query("inspections")
      .filter((q) =>
        q.and(
          q.eq(q.field("shopId"), shopId),
          q.eq(q.field("status"), "complete"),
          q.gte(q.field("completedAt"), thirtyDaysAgo),
        ),
      )
      .collect()

    // Calculate total revenue from completed inspections
    const totalRevenue = recentInspections.reduce((sum, inspection) => {
      return sum + (inspection.estimatedCost || 0)
    }, 0)

    // Get active customers
    const activeCustomers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()

    return {
      totalInspections: totalInspections.length,
      pendingInspections: pendingInspections.length,
      completedThisMonth: recentInspections.length,
      totalRevenue,
      activeCustomers: activeCustomers.length,
    }
  },
})

// Query to get recent activity for a shop
export const getRecentActivity = query({
  args: {
    shopId: v.id("shops"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { shopId, limit = 10 }) => {
    const recentInspections = await ctx.db
      .query("inspections")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .order("desc")
      .take(limit)

    // Enrich with vehicle and customer data
    const enrichedInspections = await Promise.all(
      recentInspections.map(async (inspection) => {
        const vehicle = await ctx.db.get(inspection.vehicleId)
        const customer = inspection.customerId ? await ctx.db.get(inspection.customerId) : null

        return {
          ...inspection,
          vehicle,
          customer,
        }
      }),
    )

    return enrichedInspections
  },
})

// Real-time subscription for recent activity
export const subscribeToRecentActivity = subscription({
  args: {
    shopId: v.id("shops"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { shopId, limit = 10 }) => {
    // Watch for changes in inspections, vehicles, and customers tables
    ctx.db
      .query("inspections")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .collect()

    const recentInspections = await ctx.db
      .query("inspections")
      .filter((q) => q.eq(q.field("shopId"), shopId))
      .order("desc")
      .take(limit)

    // Watch the specific vehicles and customers related to these inspections
    for (const inspection of recentInspections) {
      ctx.db.get(inspection.vehicleId)
      if (inspection.customerId) {
        ctx.db.get(inspection.customerId)
      }
    }

    // Enrich with vehicle and customer data
    const enrichedInspections = await Promise.all(
      recentInspections.map(async (inspection) => {
        const vehicle = await ctx.db.get(inspection.vehicleId)
        const customer = inspection.customerId ? await ctx.db.get(inspection.customerId) : null

        return {
          ...inspection,
          vehicle,
          customer,
        }
      }),
    )

    return enrichedInspections
  },
})

// Query to get user preferences
export const getUserPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId)
    if (!user) return null

    // Return default preferences if none exist
    return {
      theme: "light",
      dashboardLayout: "grid",
      notificationsEnabled: true,
      autoRefresh: true,
      defaultView: "dashboard",
    }
  },
})

// Mutation to update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
      dashboardLayout: v.optional(v.union(v.literal("grid"), v.literal("list"))),
      notificationsEnabled: v.optional(v.boolean()),
      autoRefresh: v.optional(v.boolean()),
      defaultView: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { userId, preferences }) => {
    // In a real implementation, you might store preferences in a separate table
    // For now, we'll just return success
    return { success: true, preferences }
  },
})

// Query to get system health status
export const getSystemHealth = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, { shopId }) => {
    // Check various system components
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // Check recent AI processing jobs
    const recentJobs = await ctx.db
      .query("aiProcessingJobs")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("createdAt"), oneHourAgo)))
      .collect()

    const failedJobs = recentJobs.filter((job) => job.status === "failed")
    const successfulJobs = recentJobs.filter((job) => job.status === "completed")

    // Check file storage health
    const recentFiles = await ctx.db
      .query("files")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("uploadedAt"), oneHourAgo)))
      .collect()

    return {
      aiProcessing: {
        status: failedJobs.length > successfulJobs.length ? "degraded" : "healthy",
        totalJobs: recentJobs.length,
        failedJobs: failedJobs.length,
        successRate: recentJobs.length > 0 ? Math.round((successfulJobs.length / recentJobs.length) * 100) : 100,
      },
      fileStorage: {
        status: "healthy",
        recentUploads: recentFiles.length,
        totalSize: recentFiles.reduce((sum, file) => sum + file.size, 0),
      },
      database: {
        status: "healthy",
        responseTime: Math.random() * 50 + 10, // Simulated response time
      },
    }
  },
})

// Real-time subscription for system health
export const subscribeToSystemHealth = subscription({
  args: { shopId: v.id("shops") },
  handler: async (ctx, { shopId }) => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // Watch for changes in AI processing jobs and files
    ctx.db
      .query("aiProcessingJobs")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("createdAt"), oneHourAgo)))
      .collect()

    ctx.db
      .query("files")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("uploadedAt"), oneHourAgo)))
      .collect()

    // Check recent AI processing jobs
    const recentJobs = await ctx.db
      .query("aiProcessingJobs")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("createdAt"), oneHourAgo)))
      .collect()

    const failedJobs = recentJobs.filter((job) => job.status === "failed")
    const successfulJobs = recentJobs.filter((job) => job.status === "completed")

    // Check file storage health
    const recentFiles = await ctx.db
      .query("files")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("uploadedAt"), oneHourAgo)))
      .collect()

    return {
      aiProcessing: {
        status: failedJobs.length > successfulJobs.length ? "degraded" : "healthy",
        totalJobs: recentJobs.length,
        failedJobs: failedJobs.length,
        successRate: recentJobs.length > 0 ? Math.round((successfulJobs.length / recentJobs.length) * 100) : 100,
      },
      fileStorage: {
        status: "healthy",
        recentUploads: recentFiles.length,
        totalSize: recentFiles.reduce((sum, file) => sum + file.size, 0),
      },
      database: {
        status: "healthy",
        responseTime: Math.random() * 50 + 10, // Simulated response time
      },
    }
  },
})

// Query to get notification settings for a shop
export const getNotificationSettings = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, { shopId }) => {
    // Return default notification settings
    return {
      emailNotifications: true,
      smsNotifications: false,
      inspectionComplete: true,
      inspectionFailed: true,
      lowBalance: true,
      systemAlerts: true,
      weeklyReports: true,
    }
  },
})

// Mutation to update notification settings
export const updateNotificationSettings = mutation({
  args: {
    shopId: v.id("shops"),
    settings: v.object({
      emailNotifications: v.optional(v.boolean()),
      smsNotifications: v.optional(v.boolean()),
      inspectionComplete: v.optional(v.boolean()),
      inspectionFailed: v.optional(v.boolean()),
      lowBalance: v.optional(v.boolean()),
      systemAlerts: v.optional(v.boolean()),
      weeklyReports: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { shopId, settings }) => {
    // In a real implementation, store these in a notifications table
    return { success: true, settings }
  },
})

// Query to get component analytics
export const getComponentAnalytics = query({
  args: {
    shopId: v.id("shops"),
    timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"))),
  },
  handler: async (ctx, { shopId, timeRange = "30d" }) => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000

    // Get inspections in time range
    const inspections = await ctx.db
      .query("inspections")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("createdAt"), startTime)))
      .collect()

    // Group by day
    const dailyStats = new Map<string, number>()
    inspections.forEach((inspection) => {
      const date = new Date(inspection.createdAt).toISOString().split("T")[0]
      dailyStats.set(date, (dailyStats.get(date) || 0) + 1)
    })

    // Convert to array format
    const chartData = Array.from(dailyStats.entries()).map(([date, count]) => ({
      date,
      inspections: count,
    }))

    return {
      totalInspections: inspections.length,
      averagePerDay: Math.round(inspections.length / days),
      chartData: chartData.sort((a, b) => a.date.localeCompare(b.date)),
    }
  },
})

// Real-time subscription for component analytics
export const subscribeToComponentAnalytics = subscription({
  args: {
    shopId: v.id("shops"),
    timeRange: v.optional(v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"))),
  },
  handler: async (ctx, { shopId, timeRange = "30d" }) => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000

    // Watch for changes in inspections within the time range
    ctx.db
      .query("inspections")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("createdAt"), startTime)))
      .collect()

    // Get inspections in time range
    const inspections = await ctx.db
      .query("inspections")
      .filter((q) => q.and(q.eq(q.field("shopId"), shopId), q.gte(q.field("createdAt"), startTime)))
      .collect()

    // Group by day
    const dailyStats = new Map<string, number>()
    inspections.forEach((inspection) => {
      const date = new Date(inspection.createdAt).toISOString().split("T")[0]
      dailyStats.set(date, (dailyStats.get(date) || 0) + 1)
    })

    // Convert to array format
    const chartData = Array.from(dailyStats.entries()).map(([date, count]) => ({
      date,
      inspections: count,
    }))

    return {
      totalInspections: inspections.length,
      averagePerDay: Math.round(inspections.length / days),
      chartData: chartData.sort((a, b) => a.date.localeCompare(b.date)),
    }
  },
})
