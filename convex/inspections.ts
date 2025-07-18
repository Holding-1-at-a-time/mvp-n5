import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

// Create a new inspection
export const create = mutation({
  args: {
    shopId: v.id("shops"),
    vehicleId: v.id("vehicles"),
    customerId: v.optional(v.id("customers")),
    type: v.union(v.literal("routine"), v.literal("diagnostic"), v.literal("pre-purchase"), v.literal("insurance")),
    scheduledDate: v.number(),
    inspector: v.string(),
    notes: v.optional(v.string()),
    checklist: v.optional(
      v.array(
        v.object({
          item: v.string(),
          status: v.union(v.literal("pass"), v.literal("fail"), v.literal("warning"), v.literal("na")),
          notes: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    // Verify vehicle exists and belongs to shop
    const vehicle = await ctx.db.get(args.vehicleId)
    if (!vehicle || vehicle.shopId !== args.shopId) {
      throw new Error("Invalid vehicle")
    }

    // Verify customer if provided
    if (args.customerId) {
      const customer = await ctx.db.get(args.customerId)
      if (!customer || customer.shopId !== args.shopId) {
        throw new Error("Invalid customer")
      }
    }

    const inspectionId = await ctx.db.insert("inspections", {
      ...args,
      status: "scheduled",
      findings: {},
      aiAnalysis: {
        status: "pending",
        confidence: 0,
        findings: [],
      },
    })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "inspections",
      recordId: inspectionId,
      operation: "INSERT",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { created: true },
    })

    return inspectionId
  },
})

// Get inspection by ID
export const get = query({
  args: { id: v.id("inspections") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const inspection = await ctx.db.get(args.id)
    if (!inspection) return null

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", inspection.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    // Get related data
    const vehicle = await ctx.db.get(inspection.vehicleId)
    let customer = null
    if (inspection.customerId) {
      customer = await ctx.db.get(inspection.customerId)
    }

    // Get attachments
    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_entity", (q) => q.eq("entityType", "inspections").eq("entityId", args.id))
      .collect()

    return { ...inspection, vehicle, customer, attachments }
  },
})

// List inspections for a shop
export const list = query({
  args: {
    shopId: v.id("shops"),
    vehicleId: v.optional(v.id("vehicles")),
    customerId: v.optional(v.id("customers")),
    status: v.optional(
      v.union(v.literal("scheduled"), v.literal("in-progress"), v.literal("completed"), v.literal("cancelled")),
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    let query = ctx.db.query("inspections").withIndex("by_shop_date", (q) => q.eq("shopId", args.shopId))

    if (args.vehicleId) {
      query = ctx.db.query("inspections").withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
    }

    if (args.customerId) {
      query = ctx.db.query("inspections").withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
    }

    let inspections = await query.order("desc").collect()

    if (args.status) {
      inspections = inspections.filter((i) => i.status === args.status)
    }

    return inspections.slice(0, args.limit || 50)
  },
})

// Update inspection status
export const updateStatus = mutation({
  args: {
    id: v.id("inspections"),
    status: v.union(v.literal("scheduled"), v.literal("in-progress"), v.literal("completed"), v.literal("cancelled")),
    findings: v.optional(v.record(v.string(), v.string())),
    checklist: v.optional(
      v.array(
        v.object({
          item: v.string(),
          status: v.union(v.literal("pass"), v.literal("fail"), v.literal("warning"), v.literal("na")),
          notes: v.optional(v.string()),
        }),
      ),
    ),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const inspection = await ctx.db.get(args.id)
    if (!inspection) throw new Error("Inspection not found")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", inspection.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    const { id, ...updates } = args
    const changedFields: Record<string, any> = {}

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        changedFields[key] = value
      }
    })

    await ctx.db.patch(args.id, updates)

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: inspection.shopId,
      tableName: "inspections",
      recordId: args.id,
      operation: "UPDATE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields,
    })

    // Trigger AI analysis if inspection is completed
    if (args.status === "completed") {
      await ctx.scheduler.runAfter(0, api.ai.analyzeInspection, { inspectionId: args.id })
    }

    return { success: true }
  },
})

// Get inspection statistics
export const getStats = query({
  args: {
    shopId: v.id("shops"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    const inspections = await ctx.db
      .query("inspections")
      .withIndex("by_shop_date", (q) => q.eq("shopId", args.shopId))
      .collect()

    const filteredInspections = inspections.filter((i) => {
      if (args.startDate && i.scheduledDate < args.startDate) return false
      if (args.endDate && i.scheduledDate > args.endDate) return false
      return true
    })

    const stats = {
      total: filteredInspections.length,
      scheduled: filteredInspections.filter((i) => i.status === "scheduled").length,
      inProgress: filteredInspections.filter((i) => i.status === "in-progress").length,
      completed: filteredInspections.filter((i) => i.status === "completed").length,
      cancelled: filteredInspections.filter((i) => i.status === "cancelled").length,
      byType: {
        routine: filteredInspections.filter((i) => i.type === "routine").length,
        diagnostic: filteredInspections.filter((i) => i.type === "diagnostic").length,
        prePurchase: filteredInspections.filter((i) => i.type === "pre-purchase").length,
        insurance: filteredInspections.filter((i) => i.type === "insurance").length,
      },
    }

    return stats
  },
})
