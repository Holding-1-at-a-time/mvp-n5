import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Create a new shop (tenant)
export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    contactEmail: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    settings: v.optional(
      v.object({
        timezone: v.string(),
        currency: v.string(),
        businessHours: v.object({
          monday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          tuesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          wednesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          thursday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          friday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          saturday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          sunday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
        }),
        features: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const shopId = await ctx.db.insert("shops", {
      ...args,
      createdBy: identity.subject,
      status: "active",
      subscription: {
        plan: "trial",
        status: "active",
        expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days trial
      },
      settings: args.settings || {
        timezone: "UTC",
        currency: "USD",
        businessHours: {
          monday: { open: "09:00", close: "17:00", closed: false },
          tuesday: { open: "09:00", close: "17:00", closed: false },
          wednesday: { open: "09:00", close: "17:00", closed: false },
          thursday: { open: "09:00", close: "17:00", closed: false },
          friday: { open: "09:00", close: "17:00", closed: false },
          saturday: { open: "09:00", close: "17:00", closed: false },
          sunday: { open: "09:00", close: "17:00", closed: true },
        },
        features: ["inspections", "pricing", "scheduling"],
      },
    })

    // Create default admin user role
    await ctx.db.insert("users", {
      shopId,
      email: args.contactEmail,
      name: "Admin User",
      role: "admin",
      status: "active",
      authId: identity.subject,
    })

    return shopId
  },
})

// Get shop by ID
export const get = query({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const shop = await ctx.db.get(args.id)
    if (!shop) return null

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.id).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    return shop
  },
})

// Update shop settings
export const updateSettings = mutation({
  args: {
    shopId: v.id("shops"),
    settings: v.object({
      timezone: v.optional(v.string()),
      currency: v.optional(v.string()),
      businessHours: v.optional(
        v.object({
          monday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          tuesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          wednesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          thursday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          friday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          saturday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
          sunday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
        }),
      ),
      features: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify admin access
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", args.shopId).eq("authId", identity.subject))
      .first()

    if (!user || user.role !== "admin") throw new Error("Admin access required")

    const shop = await ctx.db.get(args.shopId)
    if (!shop) throw new Error("Shop not found")

    await ctx.db.patch(args.shopId, {
      settings: { ...shop.settings, ...args.settings },
    })

    return { success: true }
  },
})

// List shops for current user
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const userShops = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .collect()

    const shops = await Promise.all(
      userShops.map(async (user) => {
        const shop = await ctx.db.get(user.shopId)
        return shop ? { ...shop, userRole: user.role } : null
      }),
    )

    return shops.filter(Boolean)
  },
})
