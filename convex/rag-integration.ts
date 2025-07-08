import { v } from "convex/values"
import { action, mutation, query } from "./_generated/server"
import { api } from "./_generated/api"
import { RAG } from "@convex-dev/rag"
import { components } from "./_generated/api"

// Initialize RAG client with embedding configuration
const ragClient = new RAG(components.rag, {
  textEmbeddingModel: "openai:text-embedding-3-small", // Using OpenAI embeddings
  embeddingDimension: 1536,
})

// Add inspection summary to RAG for future similarity searches
export const addInspectionToRag = action({
  args: {
    shopId: v.string(),
    inspectionId: v.id("inspections"),
    summaryText: v.string(),
    metadata: v.object({
      vinNumber: v.string(),
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      year: v.optional(v.number()),
      damageTypes: v.array(v.string()),
      totalCost: v.number(),
      severity: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Split summary into manageable chunks (~500 words each)
      const chunks = chunkText(args.summaryText, 500)

      // Add to RAG with inspection namespace
      await ragClient.add(ctx, {
        namespace: `${args.shopId}-inspections`,
        key: args.inspectionId,
        chunks,
        filterValues: [
          { name: "type", value: "inspection" },
          { name: "make", value: args.metadata.make || "unknown" },
          { name: "severity", value: args.metadata.severity },
          { name: "year", value: args.metadata.year?.toString() || "unknown" },
        ],
      })

      // Also store in knowledge base table for tracking
      await ctx.runMutation(api.ragIntegration.storeKnowledgeEntry, {
        shopId: args.shopId,
        namespace: "inspections",
        content: args.summaryText,
        metadata: {
          type: "inspection",
          inspectionId: args.inspectionId,
          createdAt: Date.now(),
          ...args.metadata,
        },
      })

      return { success: true, chunksAdded: chunks.length }
    } catch (error) {
      console.error("Failed to add inspection to RAG:", error)
      throw error
    }
  },
})

// Add service procedures and best practices to RAG
export const addServiceProcedureToRag = action({
  args: {
    shopId: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.string(), // e.g., "paint_correction", "leather_care", "glass_repair"
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const chunks = chunkText(args.content, 300) // Smaller chunks for procedures

      await ragClient.add(ctx, {
        namespace: `${args.shopId}-procedures`,
        key: `procedure_${Date.now()}`,
        chunks,
        filterValues: [
          { name: "type", value: "procedure" },
          { name: "category", value: args.category },
        ],
      })

      await ctx.runMutation(api.ragIntegration.storeKnowledgeEntry, {
        shopId: args.shopId,
        namespace: "procedures",
        content: args.content,
        metadata: {
          type: "procedure",
          category: args.category,
          createdAt: Date.now(),
        },
      })

      return { success: true, chunksAdded: chunks.length }
    } catch (error) {
      console.error("Failed to add procedure to RAG:", error)
      throw error
    }
  },
})

// Query RAG for similar inspections
export const getSimilarInspections = action({
  args: {
    shopId: v.string(),
    queryText: v.string(),
    filters: v.optional(
      v.object({
        make: v.optional(v.string()),
        severity: v.optional(v.string()),
        damageType: v.optional(v.string()),
      }),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Generate embedding for the query
      const embedding = await ragClient.embedText(ctx, args.queryText)

      // Build filter values
      const filterValues = [{ name: "type", value: "inspection" }]
      if (args.filters?.make) {
        filterValues.push({ name: "make", value: args.filters.make })
      }
      if (args.filters?.severity) {
        filterValues.push({ name: "severity", value: args.filters.severity })
      }

      // Get relevant chunks
      const results = await ragClient.getRelevant(ctx, {
        namespace: `${args.shopId}-inspections`,
        queryEmbedding: embedding,
        k: args.limit || 5,
        filterValues,
      })

      return {
        success: true,
        results: results.chunks.map((chunk) => ({
          content: chunk.chunk,
          key: chunk.key,
          score: chunk.score,
        })),
      }
    } catch (error) {
      console.error("Failed to get similar inspections:", error)
      throw error
    }
  },
})

// Query RAG for service procedures
export const getRelevantProcedures = action({
  args: {
    shopId: v.string(),
    queryText: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const embedding = await ragClient.embedText(ctx, args.queryText)

      const filterValues = [{ name: "type", value: "procedure" }]
      if (args.category) {
        filterValues.push({ name: "category", value: args.category })
      }

      const results = await ragClient.getRelevant(ctx, {
        namespace: `${args.shopId}-procedures`,
        queryEmbedding: embedding,
        k: args.limit || 3,
        filterValues,
      })

      return {
        success: true,
        procedures: results.chunks.map((chunk) => ({
          content: chunk.chunk,
          key: chunk.key,
          score: chunk.score,
        })),
      }
    } catch (error) {
      console.error("Failed to get relevant procedures:", error)
      throw error
    }
  },
})

// Store knowledge base entry
export const storeKnowledgeEntry = mutation({
  args: {
    shopId: v.string(),
    namespace: v.string(),
    content: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeBase", {
      shopId: args.shopId,
      namespace: args.namespace,
      content: args.content,
      metadata: args.metadata,
    })
  },
})

// Get knowledge base stats
export const getKnowledgeStats = query({
  args: {
    shopId: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("knowledgeBase")
      .withIndex("by_shop_namespace", (q) => q.eq("shopId", args.shopId))
      .collect()

    const stats = {
      totalEntries: entries.length,
      byNamespace: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      recentEntries: entries.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt).slice(0, 10),
    }

    entries.forEach((entry) => {
      stats.byNamespace[entry.namespace] = (stats.byNamespace[entry.namespace] || 0) + 1
      stats.byType[entry.metadata.type] = (stats.byType[entry.metadata.type] || 0) + 1
    })

    return stats
  },
})

// Helper function to chunk text
function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(" ")
    chunks.push(chunk)
  }

  return chunks.length > 0 ? chunks : [text]
}

// Cleanup old RAG entries
export const cleanupOldEntries = action({
  args: {
    shopId: v.string(),
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const cutoffTime = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000

      const oldEntries = await ctx.runQuery(api.ragIntegration.getOldEntries, {
        shopId: args.shopId,
        cutoffTime,
      })

      let deletedCount = 0
      for (const entry of oldEntries) {
        // Remove from RAG
        await ragClient.remove(ctx, {
          namespace: `${args.shopId}-${entry.namespace}`,
          key: entry.metadata.inspectionId || entry._id,
        })

        // Remove from knowledge base
        await ctx.runMutation(api.ragIntegration.deleteKnowledgeEntry, {
          id: entry._id,
        })

        deletedCount++
      }

      return { success: true, deletedCount }
    } catch (error) {
      console.error("Failed to cleanup old entries:", error)
      throw error
    }
  },
})

export const getOldEntries = query({
  args: {
    shopId: v.string(),
    cutoffTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeBase")
      .withIndex("by_shop_namespace", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.lt(q.field("metadata.createdAt"), args.cutoffTime))
      .collect()
  },
})

export const deleteKnowledgeEntry = mutation({
  args: {
    id: v.id("knowledgeBase"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
