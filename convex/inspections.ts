import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    vinNumber: v.string(),
    imageIds: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"), v.literal("failed")),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inspections", args)
  },
})

export const get = query({
  args: { id: v.id("inspections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id("inspections"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"), v.literal("failed")),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    return await ctx.db.patch(id, updates)
  },
})

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("inspections").order("desc").collect()
  },
})
