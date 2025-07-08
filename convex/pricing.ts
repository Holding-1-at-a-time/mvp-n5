import { mutation, query, action } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api" // Declare the api variable

// Create pricing rule
export const createRule = mutation({
  args: {
    shopId: v.id("shops"),
    name: v.string(),
    vehicleType: v.string(),
    serviceType: v.string(),
    baseRatePerHour: v.number(),
    surgeMultiplier: v.optional(v.number()),
    conditions: v.optional(
      v.array(
        v.object({
          field: v.string(),
          operator: v.union(v.literal("eq"), v.literal("gt"), v.literal("lt"), v.literal("gte"), v.literal("lte")),
          value: v.union(v.string(), v.number()),
        }),
      ),
    ),
    effectiveFrom: v.number(),
    effectiveTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has admin access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user || user.role !== "admin") throw new Error("Admin access required")

    const ruleId = await ctx.db.insert("pricingRules", {
      ...args,
      status: "active",
      surgeMultiplier: args.surgeMultiplier || 1.0,
    })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "pricingRules",
      recordId: ruleId,
      operation: "INSERT",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { created: true },
    })

    return ruleId
  },
})

// Get pricing rules for a shop
export const getRules = query({
  args: {
    shopId: v.id("shops"),
    vehicleType: v.optional(v.string()),
    serviceType: v.optional(v.string()),
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

    let query = ctx.db
      .query("pricingRules")
      .withIndex("by_shop_effectiveFrom", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.eq(q.field("status"), "active"))

    if (args.vehicleType) {
      query = query.filter((q) => q.eq(q.field("vehicleType"), args.vehicleType))
    }

    if (args.serviceType) {
      query = query.filter((q) => q.eq(q.field("serviceType"), args.serviceType))
    }

    const rules = await query.collect()

    // Filter by effective dates
    const now = Date.now()
    return rules.filter((rule) => {
      if (rule.effectiveFrom > now) return false
      if (rule.effectiveTo && rule.effectiveTo < now) return false
      return true
    })
  },
})

// Calculate estimate for inspection
export const calculateEstimate = action({
  args: {
    shopId: v.id("shops"),
    vehicleId: v.id("vehicles"),
    serviceType: v.string(),
    estimatedHours: v.number(),
    damageFindings: v.optional(
      v.array(
        v.object({
          damageType: v.string(),
          severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
          location: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Get vehicle details
    const vehicle = await ctx.runQuery(api.vehicles.get, { id: args.vehicleId })
    if (!vehicle || vehicle.shopId !== args.shopId) {
      throw new Error("Invalid vehicle")
    }

    // Get applicable pricing rules
    const rules = await ctx.runQuery(api.pricing.getRules, {
      shopId: args.shopId,
      vehicleType: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      serviceType: args.serviceType,
    })

    if (rules.length === 0) {
      throw new Error("No pricing rules found for this vehicle type and service")
    }

    // Use the most recent rule
    const rule = rules.sort((a, b) => b.effectiveFrom - a.effectiveFrom)[0]

    // Calculate base cost
    let baseCost = rule.baseRatePerHour * args.estimatedHours

    // Apply surge multiplier
    baseCost *= rule.surgeMultiplier

    // Apply damage-based adjustments
    let damageMultiplier = 1.0
    if (args.damageFindings) {
      for (const finding of args.damageFindings) {
        switch (finding.severity) {
          case "low":
            damageMultiplier += 0.1
            break
          case "medium":
            damageMultiplier += 0.25
            break
          case "high":
            damageMultiplier += 0.5
            break
        }
      }
    }

    const finalCost = baseCost * damageMultiplier

    // Create estimate record
    const estimateId = await ctx.runMutation(api.pricing.createEstimate, {
      shopId: args.shopId,
      vehicleId: args.vehicleId,
      serviceType: args.serviceType,
      estimatedHours: args.estimatedHours,
      baseRate: rule.baseRatePerHour,
      surgeMultiplier: rule.surgeMultiplier,
      damageMultiplier,
      baseCost,
      finalCost,
      damageFindings: args.damageFindings || [],
      ruleId: rule._id,
    })

    return {
      estimateId,
      baseCost,
      finalCost,
      damageMultiplier,
      breakdown: {
        baseRate: rule.baseRatePerHour,
        hours: args.estimatedHours,
        surgeMultiplier: rule.surgeMultiplier,
        damageAdjustment: damageMultiplier - 1.0,
      },
    }
  },
})

// Create estimate record
export const createEstimate = mutation({
  args: {
    shopId: v.id("shops"),
    vehicleId: v.id("vehicles"),
    serviceType: v.string(),
    estimatedHours: v.number(),
    baseRate: v.number(),
    surgeMultiplier: v.number(),
    damageMultiplier: v.number(),
    baseCost: v.number(),
    finalCost: v.number(),
    damageFindings: v.array(
      v.object({
        damageType: v.string(),
        severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        location: v.string(),
      }),
    ),
    ruleId: v.id("pricingRules"),
  },
  handler: async (ctx, args) => {
    const estimateId = await ctx.db.insert("estimates", {
      ...args,
      status: "draft",
      validUntil: Date.now() + 7 * 24 * 60 * 60 * 1000, // Valid for 7 days
    })

    return estimateId
  },
})

// Get estimates for a shop
export const getEstimates = query({
  args: {
    shopId: v.id("shops"),
    vehicleId: v.optional(v.id("vehicles")),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("expired"),
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

    let query = ctx.db.query("estimates").withIndex("by_shop", (q) => q.eq("shopId", args.shopId))

    if (args.vehicleId) {
      query = query.filter((q) => q.eq(q.field("vehicleId"), args.vehicleId))
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status))
    }

    const estimates = await query.order("desc").collect()

    return estimates
  },
})
