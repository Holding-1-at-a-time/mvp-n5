import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Create attachment record
export const create = mutation({
  args: {
    shopId: v.id("shops"),
    entityType: v.string(),
    entityId: v.string(),
    storageId: v.id("_storage"),
    filename: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    description: v.optional(v.string()),
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

    const attachmentId = await ctx.db.insert("attachments", {
      ...args,
      uploadedBy: identity.subject,
      status: "active",
    })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "attachments",
      recordId: attachmentId,
      operation: "INSERT",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { created: true },
    })

    return attachmentId
  },
})

// Get attachment by ID
export const get = query({
  args: { id: v.id("attachments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const attachment = await ctx.db.get(args.id)
    if (!attachment) return null

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", attachment.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    return attachment
  },
})

// List attachments for an entity
export const list = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_entity", (q) => q.eq("entityType", args.entityType).eq("entityId", args.entityId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    // Verify user has access to at least one attachment's shop
    if (attachments.length > 0) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_shop_authId", (q) => q.eq("shopId", attachments[0].shopId).eq("authId", identity.subject))
        .first()

      if (!user) throw new Error("Access denied")
    }

    return attachments
  },
})

// Delete attachment
export const remove = mutation({
  args: { id: v.id("attachments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const attachment = await ctx.db.get(args.id)
    if (!attachment) throw new Error("Attachment not found")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", attachment.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    // Soft delete
    await ctx.db.patch(args.id, { status: "deleted" })

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: attachment.shopId,
      tableName: "attachments",
      recordId: args.id,
      operation: "DELETE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { deleted: true },
    })

    return { success: true }
  },
})

// Get file upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    return await ctx.storage.generateUploadUrl()
  },
})

// Get file download URL
export const getDownloadUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Find attachment record to verify access
    const attachment = await ctx.db
      .query("attachments")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first()

    if (!attachment) throw new Error("Attachment not found")

    // Verify user has access to this shop
    const user = await ctx.db
      .query("users")
      .withIndex("by_shop_authId", (q) => q.eq("shopId", attachment.shopId).eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("Access denied")

    return await ctx.storage.getUrl(args.storageId)
  },
})
