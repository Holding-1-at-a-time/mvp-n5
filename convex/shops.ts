import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// List all shops (admin only)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shops").collect()
  },
})

// Get shop by ID
export const get = query({
  args: { id: v.id("shops") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

// Create a new shop
export const create = mutation({
  args: {
    name: v.string(),
    contactEmail: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shopId = await ctx.db.insert("shops", {
      ...args,
      createdAt: Date.now(),
    })

    // Create default settings for the shop
    await ctx.db.insert("shopSettings", {
      shopId,
      laborRate: 75.0,
      skillMarkup: 0.2,
      locationSurcharge: 0.1,
      membershipDiscounts: {
        basic: 0.05,
        premium: 0.1,
        vip: 0.15,
      },
      workloadThreshold: 0.8,
      filthinessFactors: {
        clean: 1.0,
        dirty: 1.2,
        very_dirty: 1.5,
      },
      damageMultiplier: 1.0,
      areaUnitPrice: 10.0,
      createdAt: Date.now(),
    })

    return shopId
  },
})

// Update shop information
export const update = mutation({
  args: {
    id: v.id("shops"),
    name: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// Delete a shop (admin only - cascades to related data)
export const remove = mutation({
  args: { id: v.id("shops") },
  handler: async (ctx, { id }) => {
    // Note: In a real implementation, you'd want to handle cascading deletes
    // or prevent deletion if there are related records
    await ctx.db.delete(id)
  },
})

// Get shop statistics
export const getStats = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, { shopId }) => {
    const [totalInspections, activeInspections, totalVehicles, totalCustomers] = await Promise.all([
      ctx.db
        .query("inspections")
        .withIndex("by_shop", (q) => q.eq("shopId", shopId))
        .collect()
        .then((results) => results.length),
      ctx.db
        .query("inspections")
        .withIndex("by_shop_status", (q) => q.eq("shopId", shopId).eq("status", "processing"))
        .collect()
        .then((results) => results.length),
      ctx.db
        .query("vehicles")
        .withIndex("by_shop", (q) => q.eq("shopId", shopId))
        .collect()
        .then((results) => results.length),
      ctx.db
        .query("customers")
        .withIndex("by_shop", (q) => q.eq("shopId", shopId))
        .collect()
        .then((results) => results.length),
    ])

    return {
      totalInspections,
      activeInspections,
      totalVehicles,
      totalCustomers,
    }
  },
})
