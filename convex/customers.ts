import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Create a new customer
export const create = mutation({
  args: {
    shopId: v.id("shops"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        communicationMethod: v.union(v.literal("email"), v.literal("sms"), v.literal("phone")),
        reminderSettings: v.object({
          enabled: v.boolean(),
          daysBefore: v.number(),
        }),
        notes: v.optional(v.string()),
      }),
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

    // Check if customer already exists
    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_shop_email", (q) => q.eq("shopId", args.shopId).eq("email", args.email))
      .first()

    if (existingCustomer) throw new Error("Customer with this email already exists")

    const customerId = await ctx.db.insert("customers", {
      ...args,
      status: "active",
      preferences: args.preferences || {
        communicationMethod: "email",
        reminderSettings: {
          enabled: true,
          daysBefore: 1,
        },
      },
    })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "customers",
      recordId: customerId,
      operation: "INSERT",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { created: true },
    })

    return customerId
  },
})

// Get customer by ID
export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const customer = await ctx.db.get(args.id)
    if (!customer) return null

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", customer.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    return customer
  },
})

// List customers for a shop
export const list = query({
  args: {
    shopId: v.id("shops"),
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

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .order("desc")
      .paginate({ numItems: args.limit || 50, cursor: args.cursor })

    return customers
  },
})

// Update customer
export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        communicationMethod: v.union(v.literal("email"), v.literal("sms"), v.literal("phone")),
        reminderSettings: v.object({
          enabled: v.boolean(),
          daysBefore: v.number(),
        }),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const customer = await ctx.db.get(args.id)
    if (!customer) throw new Error("Customer not found")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", customer.shopId).eq("authId", identity.subject))
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
      shopId: customer.shopId,
      tableName: "customers",
      recordId: args.id,
      operation: "UPDATE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields,
    })

    return { success: true }
  },
})

// Search customers
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

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) =>
        q.or(q.eq(q.field("name"), args.query), q.eq(q.field("email"), args.query), q.eq(q.field("phone"), args.query)),
      )
      .collect()

    return customers
  },
})
