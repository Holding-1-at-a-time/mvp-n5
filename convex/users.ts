import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Create user
export const create = mutation({
  args: {
    shopId: v.id("shops"),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("technician"), v.literal("viewer")),
    authId: v.string(),
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

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_shop_email", (q) => q.eq("shopId", args.shopId).eq("email", args.email))
      .first()

    if (existingUser) throw new Error("User with this email already exists")

    const userId = await ctx.db.insert("users", {
      ...args,
      status: "active",
    })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "users",
      recordId: userId,
      operation: "INSERT",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { created: true },
    })

    return userId
  },
})

// Get user by auth ID
export const getByAuthId = query({
  args: {
    shopId: v.id("shops"),
    authId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", args.authId))
      .first()

    return user
  },
})

// List users for a shop
export const list = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    const users = await ctx.db
      .query("users")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    return users
  },
})

// Update user role
export const updateRole = mutation({
  args: {
    id: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("technician"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const targetUser = await ctx.db.get(args.id)
    if (!targetUser) throw new Error("User not found")

    // Verify user has admin access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", targetUser.shopId).eq("authId", identity.subject))
      .first()

    if (!user || user.role !== "admin") throw new Error("Admin access required")

    await ctx.db.patch(args.id, { role: args.role })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: targetUser.shopId,
      tableName: "users",
      recordId: args.id,
      operation: "UPDATE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { role: args.role },
    })

    return { success: true }
  },
})

// Deactivate user
export const deactivate = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const targetUser = await ctx.db.get(args.id)
    if (!targetUser) throw new Error("User not found")

    // Verify user has admin access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", targetUser.shopId).eq("authId", identity.subject))
      .first()

    if (!user || user.role !== "admin") throw new Error("Admin access required")

    await ctx.db.patch(args.id, { status: "inactive" })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: targetUser.shopId,
      tableName: "users",
      recordId: args.id,
      operation: "UPDATE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { status: "inactive" },
    })

    return { success: true }
  },
})
