import { mutation, query, action } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

// Create RAG namespace
export const createNamespace = mutation({
  args: {
    shopId: v.id("shops"),
    namespace: v.string(),
    description: v.optional(v.string()),
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

    // Check if namespace already exists
    const existing = await ctx.db
      .query("ragNamespaces")
      .withIndex("by_shop_namespace", (q) => q.eq("shopId", args.shopId).eq("namespace", args.namespace))
      .first()

    if (existing) throw new Error("Namespace already exists")

    const namespaceId = await ctx.db.insert("ragNamespaces", args)
    return namespaceId
  },
})

// Add RAG entry
export const addEntry = mutation({
  args: {
    shopId: v.id("shops"),
    namespace: v.string(),
    entryId: v.string(),
    chunks: v.array(v.string()),
    embeddings: v.array(v.array(v.float64())),
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

    // Verify namespace exists
    const namespace = await ctx.db
      .query("ragNamespaces")
      .withIndex("by_shop_namespace", (q) => q.eq("shopId", args.shopId).eq("namespace", args.namespace))
      .first()

    if (!namespace) throw new Error("Namespace not found")

    // Check if entry already exists
    const existing = await ctx.db
      .query("ragEntries")
      .withIndex("by_namespace", (q) => q.eq("shopId", args.shopId).eq("namespace", args.namespace))
      .filter((q) => q.eq(q.field("entryId"), args.entryId))
      .first()

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        chunks: args.chunks,
        embeddings: args.embeddings,
        metadata: args.metadata,
      })
      return existing._id
    } else {
      // Create new entry
      const entryDbId = await ctx.db.insert("ragEntries", args)
      return entryDbId
    }
  },
})

// Search RAG entries
export const search = action({
  args: {
    shopId: v.id("shops"),
    namespace: v.string(),
    query: v.string(),
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    // Verify user has access to this shop
    const user = await ctx.runQuery(api.users.getByAuthId, {
      shopId: args.shopId,
      authId: identity.subject,
    })

    if (!user) throw new Error("Access denied")

    // Perform vector search
    const results = await ctx.vectorSearch("ragEntries", "by_embedding", {
      vector: args.embedding,
      limit: args.limit || 10,
      filter: (q) => {
        let filter = q.eq("shopId", args.shopId).eq("namespace", args.namespace)

        if (args.metadata) {
          Object.entries(args.metadata).forEach(([key, value]) => {
            filter = filter.eq(`metadata.${key}`, value)
          })
        }

        return filter
      },
    })

    return results
  },
})

// Get RAG entries for a namespace
export const getEntries = query({
  args: {
    shopId: v.id("shops"),
    namespace: v.string(),
    limit: v.optional(v.number()),
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

    const entries = await ctx.db
      .query("ragEntries")
      .withIndex("by_namespace", (q) => q.eq("shopId", args.shopId).eq("namespace", args.namespace))
      .take(args.limit || 50)

    return entries
  },
})

// Delete RAG entry
export const deleteEntry = mutation({
  args: {
    shopId: v.id("shops"),
    namespace: v.string(),
    entryId: v.string(),
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

    const entry = await ctx.db
      .query("ragEntries")
      .withIndex("by_namespace", (q) => q.eq("shopId", args.shopId).eq("namespace", args.namespace))
      .filter((q) => q.eq(q.field("entryId"), args.entryId))
      .first()

    if (!entry) throw new Error("Entry not found")

    await ctx.db.delete(entry._id)

    // Log audit trail
    await ctx.db.insert("auditLogs", {
      shopId: args.shopId,
      tableName: "ragEntries",
      recordId: entry._id,
      operation: "DELETE",
      timestamp: Date.now(),
      userId: identity.subject,
      changedFields: { deleted: true },
    })

    return { success: true }
  },
})

// List namespaces for a shop
export const listNamespaces = query({
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

    const namespaces = await ctx.db
      .query("ragNamespaces")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .collect()

    return namespaces
  },
})
