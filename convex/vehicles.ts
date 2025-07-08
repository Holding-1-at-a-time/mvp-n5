import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Create a new vehicle
export const create = mutation({
  args: {
    shopId: v.id("shops"),
    customerId: v.optional(v.id("customers")),
    vin: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    licensePlate: v.string(),
    color: v.optional(v.string()),
    mileage: v.optional(v.number()),
    engineType: v.optional(v.string()),
    transmission: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
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

    // Check if vehicle with this VIN already exists for this shop
    const existingVehicle = await ctx.db
      .query("vehicles")
      .withIndex("by_shop_vin", (q) => q.eq("shopId", args.shopId).eq("vin", args.vin))
      .first()

    if (existingVehicle) throw new Error("Vehicle with this VIN already exists")

    // Verify customer exists if provided
    if (args.customerId) {
      const customer = await ctx.db.get(args.customerId)
      if (!customer || customer.shopId !== args.shopId) {
        throw new Error("Invalid customer")
      }
    }

    const vehicleId = await ctx.db.insert("vehicles", {
      ...args,
      status: "active",
    })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "vehicles",
      recordId: vehicleId,
      operation: "INSERT",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { created: true },
    })

    return vehicleId
  },
})

// Get vehicle by ID
export const get = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const vehicle = await ctx.db.get(args.id)
    if (!vehicle) return null

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", vehicle.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    // Get customer info if linked
    let customer = null
    if (vehicle.customerId) {
      customer = await ctx.db.get(vehicle.customerId)
    }

    return { ...vehicle, customer }
  },
})

// List vehicles for a shop
export const list = query({
  args: {
    shopId: v.id("shops"),
    customerId: v.optional(v.id("customers")),
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

    let query = ctx.db.query("vehicles").withIndex("by_shop", (q) => q.eq("shopId", args.shopId))

    if (args.customerId) {
      query = ctx.db.query("vehicles").withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
    }

    const vehicles = await query.order("desc").paginate({ numItems: args.limit || 50, cursor: args.cursor })

    return vehicles
  },
})

// Search vehicles by VIN or license plate
export const search = query({
  args: {
    shopId: v.id("shops"),
    query: v.string(),
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

    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.or(q.eq(q.field("vin"), args.query), q.eq(q.field("licensePlate"), args.query)))
      .collect()

    return vehicles
  },
})

// Update vehicle
export const update = mutation({
  args: {
    id: v.id("vehicles"),
    customerId: v.optional(v.id("customers")),
    licensePlate: v.optional(v.string()),
    color: v.optional(v.string()),
    mileage: v.optional(v.number()),
    engineType: v.optional(v.string()),
    transmission: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const vehicle = await ctx.db.get(args.id)
    if (!vehicle) throw new Error("Vehicle not found")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", vehicle.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    // Verify customer exists if provided
    if (args.customerId) {
      const customer = await ctx.db.get(args.customerId)
      if (!customer || customer.shopId !== vehicle.shopId) {
        throw new Error("Invalid customer")
      }
    }

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
      shopId: vehicle.shopId,
      tableName: "vehicles",
      recordId: args.id,
      operation: "UPDATE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields,
    })

    return { success: true }
  },
})
