import { v } from "convex/values"
import { query, mutation } from "./_generated/server"

// Enhanced error handling for Convex functions
function handleConvexError(error: unknown, context: string): never {
  console.error(`Convex error in ${context}:`, error)

  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`)
  }

  throw new Error(`${context}: Unknown error occurred`)
}

// Dashboard statistics with error handling
export const getDashboardStats = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error("Authentication required")
      }

      // Verify user has access to this shop
      const user = await ctx.db
        .query("users")
        .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
        .first()

      if (!user) {
        throw new Error("Access denied to shop data")
      }

      // Get all inspections for the shop with error handling
      const inspections = await ctx.db
        .query("inspections")
        .withIndex("by_shop_date", (q) => q.eq("shopId", args.shopId))
        .collect()

      if (!inspections) {
        throw new Error("Failed to fetch inspections")
      }

      // Calculate statistics with null checks
      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

      const recentInspections = inspections.filter((i) => i.scheduledDate && i.scheduledDate >= thirtyDaysAgo)

      const stats = {
        totalInspections: inspections.length || 0,
        pendingInspections: inspections.filter((i) => i.status === "scheduled").length || 0,
        completedInspections: inspections.filter((i) => i.status === "completed").length || 0,
        recentInspections: recentInspections.length || 0,
        revenue: recentInspections
          .filter((i) => i.status === "completed")
          .reduce((sum, i) => sum + (i.totalCost || 0), 0),
        averageProcessingTime: calculateAverageProcessingTime(recentInspections),
        aiAccuracy: calculateAIAccuracy(recentInspections),
        customerSatisfaction: 4.2, // Mock data - would come from reviews
      }

      return stats
    } catch (error) {
      handleConvexError(error, "getDashboardStats")
    }
  },
})

// Recent activity with comprehensive error handling
export const getRecentActivity = query({
  args: {
    shopId: v.id("shops"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error("Authentication required")
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
        .first()

      if (!user) {
        throw new Error("Access denied to shop data")
      }

      const limit = Math.min(args.limit || 10, 50) // Cap at 50 items

      const inspections = await ctx.db
        .query("inspections")
        .withIndex("by_shop_date", (q) => q.eq("shopId", args.shopId))
        .order("desc")
        .take(limit)

      if (!inspections) {
        return [] // Return empty array instead of throwing
      }

      // Enrich with vehicle and customer data
      const enrichedInspections = await Promise.allSettled(
        inspections.map(async (inspection) => {
          try {
            const [vehicle, customer] = await Promise.all([
              inspection.vehicleId ? ctx.db.get(inspection.vehicleId) : null,
              inspection.customerId ? ctx.db.get(inspection.customerId) : null,
            ])

            return {
              ...inspection,
              vehicle: vehicle || { make: "Unknown", model: "Unknown", year: 0 },
              customer: customer || { name: "Unknown Customer", email: "" },
            }
          } catch (error) {
            console.error("Error enriching inspection:", error)
            return {
              ...inspection,
              vehicle: { make: "Unknown", model: "Unknown", year: 0 },
              customer: { name: "Unknown Customer", email: "" },
            }
          }
        }),
      )

      // Filter out failed enrichments and return successful ones
      return enrichedInspections
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<any>).value)
    } catch (error) {
      console.error("Error in getRecentActivity:", error)
      return [] // Return empty array on error instead of throwing
    }
  },
})

// System health monitoring with error handling
export const getSystemHealth = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error("Authentication required")
      }

      // Check database connectivity
      const dbHealthy = await checkDatabaseHealth(ctx, args.shopId)

      // Check AI processing status
      const aiHealthy = await checkAIHealth(ctx, args.shopId)

      // Check file storage
      const storageHealthy = await checkStorageHealth(ctx)

      const overallHealth = dbHealthy && aiHealthy && storageHealthy

      return {
        overall: overallHealth ? "healthy" : "degraded",
        database: dbHealthy ? "healthy" : "error",
        aiProcessing: aiHealthy ? "healthy" : "warning",
        fileStorage: storageHealthy ? "healthy" : "error",
        lastChecked: Date.now(),
        uptime: calculateUptime(),
        errorRate: await calculateErrorRate(ctx, args.shopId),
      }
    } catch (error) {
      console.error("Error checking system health:", error)
      return {
        overall: "error",
        database: "unknown",
        aiProcessing: "unknown",
        fileStorage: "unknown",
        lastChecked: Date.now(),
        uptime: 0,
        errorRate: 1.0,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
})

// User preferences with error handling
export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity || identity.subject !== args.userId) {
        throw new Error("Access denied")
      }

      const preferences = await ctx.db
        .query("userPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first()

      return preferences?.preferences || getDefaultPreferences()
    } catch (error) {
      console.error("Error getting user preferences:", error)
      return getDefaultPreferences()
    }
  },
})

export const updateUserPreferences = mutation({
  args: {
    userId: v.string(),
    preferences: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity || identity.subject !== args.userId) {
        throw new Error("Access denied")
      }

      const existing = await ctx.db
        .query("userPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, {
          preferences: { ...existing.preferences, ...args.preferences },
          updatedAt: Date.now(),
        })
      } else {
        await ctx.db.insert("userPreferences", {
          userId: args.userId,
          preferences: args.preferences,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating user preferences:", error)
      throw new Error("Failed to update preferences")
    }
  },
})

// Analytics with error handling
export const getAnalyticsData = query({
  args: {
    shopId: v.id("shops"),
    timeRange: v.union(v.literal("7d"), v.literal("30d"), v.literal("90d")),
    metric: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error("Authentication required")
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
        .first()

      if (!user) {
        throw new Error("Access denied")
      }

      const days = Number.parseInt(args.timeRange.replace("d", ""))
      const startDate = Date.now() - days * 24 * 60 * 60 * 1000

      const inspections = await ctx.db
        .query("inspections")
        .withIndex("by_shop_date", (q) => q.eq("shopId", args.shopId))
        .filter((q) => q.gte(q.field("scheduledDate"), startDate))
        .collect()

      return generateAnalyticsData(inspections, args.metric, days)
    } catch (error) {
      console.error("Error getting analytics data:", error)
      return generateEmptyAnalyticsData(args.metric)
    }
  },
})

// Helper functions with error handling
async function checkDatabaseHealth(ctx: any, shopId: string): Promise<boolean> {
  try {
    const testQuery = await ctx.db
      .query("shops")
      .filter((q: any) => q.eq(q.field("_id"), shopId))
      .first()
    return testQuery !== null
  } catch {
    return false
  }
}

async function checkAIHealth(ctx: any, shopId: string): Promise<boolean> {
  try {
    const recentInspections = await ctx.db
      .query("inspections")
      .withIndex("by_shop_date", (q: any) => q.eq("shopId", shopId))
      .order("desc")
      .take(10)

    const aiProcessedCount = recentInspections.filter((i: any) => i.aiAnalysis?.status === "completed").length

    return aiProcessedCount > 0 || recentInspections.length === 0
  } catch {
    return false
  }
}

async function checkStorageHealth(ctx: any): Promise<boolean> {
  try {
    // Try to generate an upload URL to test storage connectivity
    await ctx.storage.generateUploadUrl()
    return true
  } catch {
    return false
  }
}

function calculateAverageProcessingTime(inspections: any[]): number {
  const completedInspections = inspections.filter((i) => i.status === "completed" && i.completedAt && i.scheduledDate)

  if (completedInspections.length === 0) return 0

  const totalTime = completedInspections.reduce((sum, i) => sum + (i.completedAt - i.scheduledDate), 0)

  return Math.round(totalTime / completedInspections.length / (1000 * 60)) // minutes
}

function calculateAIAccuracy(inspections: any[]): number {
  const aiProcessed = inspections.filter((i) => i.aiAnalysis?.status === "completed" && i.aiAnalysis?.confidence)

  if (aiProcessed.length === 0) return 0

  const totalConfidence = aiProcessed.reduce((sum, i) => sum + (i.aiAnalysis?.confidence || 0), 0)

  return Math.round((totalConfidence / aiProcessed.length) * 100) / 100
}

function calculateUptime(): number {
  // Mock uptime calculation - in real app would track actual uptime
  return Math.random() * 0.05 + 0.95 // 95-100% uptime
}

async function calculateErrorRate(ctx: any, shopId: string): Promise<number> {
  try {
    const recentInspections = await ctx.db
      .query("inspections")
      .withIndex("by_shop_date", (q: any) => q.eq("shopId", shopId))
      .order("desc")
      .take(100)

    if (recentInspections.length === 0) return 0

    const failedCount = recentInspections.filter((i) => i.status === "failed").length
    return failedCount / recentInspections.length
  } catch {
    return 0.1 // Default 10% error rate if can't calculate
  }
}

function getDefaultPreferences() {
  return {
    theme: "light",
    notifications: true,
    autoRefresh: true,
    dashboardLayout: "default",
    language: "en",
  }
}

function generateAnalyticsData(inspections: any[], metric: string, days: number) {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime()

    const dayInspections = inspections.filter(
      (inspection) => inspection.scheduledDate >= dayStart && inspection.scheduledDate <= dayEnd,
    )

    let value = 0
    switch (metric) {
      case "inspections":
        value = dayInspections.length
        break
      case "revenue":
        value = dayInspections.filter((i) => i.status === "completed").reduce((sum, i) => sum + (i.totalCost || 0), 0)
        break
      case "completion_rate":
        const completed = dayInspections.filter((i) => i.status === "completed").length
        value = dayInspections.length > 0 ? (completed / dayInspections.length) * 100 : 0
        break
      default:
        value = dayInspections.length
    }

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value * 100) / 100,
    })
  }

  return data
}

function generateEmptyAnalyticsData(metric: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split("T")[0],
      value: 0,
    }
  })
}
