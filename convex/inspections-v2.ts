import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { api } from "./_generated/api"

// V2 Inspection creation with enhanced media support
export const createV2Inspection = mutation({
  args: {
    vin: v.string(),
    media: v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("video")),
        url: v.string(),
        timestamp: v.optional(v.number()),
        metadata: v.optional(
          v.object({
            width: v.optional(v.number()),
            height: v.optional(v.number()),
            duration: v.optional(v.number()),
            format: v.optional(v.string()),
          }),
        ),
      }),
    ),
    options: v.object({
      enableStreaming: v.optional(v.boolean()),
      partialResults: v.optional(v.boolean()),
      confidenceThreshold: v.optional(v.number()),
      priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"))),
      webhookUrl: v.optional(v.string()),
    }),
    metadata: v.object({
      location: v.optional(
        v.object({
          latitude: v.optional(v.number()),
          longitude: v.optional(v.number()),
          address: v.optional(v.string()),
        }),
      ),
      inspector: v.optional(
        v.object({
          id: v.optional(v.string()),
          name: v.optional(v.string()),
        }),
      ),
      customerInfo: v.optional(
        v.object({
          id: v.optional(v.string()),
          name: v.optional(v.string()),
          contact: v.optional(v.string()),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    // Create inspection record
    const inspectionId = await ctx.db.insert("inspections", {
      vinNumber: args.vin,
      imageIds: [], // Will be populated after media processing
      status: "pending",
      createdAt: Date.now(),
      metadata: {
        make: "Unknown", // Will be populated by VIN decode
        model: "Unknown",
        year: 0,
      },
      // V2 specific fields
      mediaFiles: args.media,
      processingOptions: args.options,
      inspectionMetadata: args.metadata,
      apiVersion: "2.0",
    })

    // Schedule VIN decoding
    await ctx.scheduler.runAfter(0, api.workflows.decodeVinV2, {
      inspectionId,
      vin: args.vin,
    })

    // Schedule media processing based on priority
    const delay = args.options.priority === "high" ? 0 : args.options.priority === "low" ? 30000 : 10000

    await ctx.scheduler.runAfter(delay, api.workflows.processMediaV2, {
      inspectionId,
      media: args.media,
      options: args.options,
    })

    return inspectionId
  },
})

// Get inspection with V2 enhanced data
export const getInspectionV2 = query({
  args: { id: v.id("inspections") },
  handler: async (ctx, args) => {
    const inspection = await ctx.db.get(args.id)
    if (!inspection) return null

    // Get associated damages with enhanced metadata
    const damages = await ctx.db
      .query("damages")
      .withIndex("by_inspection", (q) => q.eq("inspectionId", args.id))
      .collect()

    // Get estimate items
    const estimateItems = await ctx.db
      .query("estimateItems")
      .withIndex("by_inspection", (q) => q.eq("inspectionId", args.id))
      .collect()

    // Calculate totals
    const totalCost = estimateItems.reduce((sum, item) => sum + item.totalCost, 0)
    const totalLaborHours = estimateItems.reduce((sum, item) => sum + item.laborHours, 0)
    const totalPartsCost = estimateItems.reduce((sum, item) => sum + item.partsCost, 0)
    const totalLaborCost = estimateItems.reduce((sum, item) => sum + item.laborHours * item.laborRate, 0)

    return {
      ...inspection,
      damages: damages.map((damage) => ({
        ...damage,
        id: damage._id,
        mediaSource: damage.imageId, // Map to media source
        timestamp: damage._creationTime,
      })),
      estimate: {
        totalCost,
        laborHours: totalLaborHours,
        partsCost: totalPartsCost,
        laborCost: totalLaborCost,
        breakdown: estimateItems.map((item) => ({
          damageId: item.damageId,
          description: item.description,
          cost: item.totalCost,
          category: item.category,
        })),
      },
      processingTime: inspection.completedAt ? inspection.completedAt - inspection.createdAt : null,
    }
  },
})

// Stream inspection updates (for WebSocket connections)
export const streamInspectionUpdates = query({
  args: { id: v.id("inspections") },
  handler: async (ctx, args) => {
    const inspection = await ctx.db.get(args.id)
    if (!inspection) return null

    // Get latest damages (for partial results)
    const damages = await ctx.db
      .query("damages")
      .withIndex("by_inspection", (q) => q.eq("inspectionId", args.id))
      .order("desc")
      .take(10) // Latest 10 damages

    return {
      inspectionId: args.id,
      status: inspection.status,
      progress: {
        mediaProcessed: inspection.imageIds?.length || 0,
        totalMedia: inspection.mediaFiles?.length || 0,
        damagesFound: damages.length,
        lastUpdate: Date.now(),
      },
      latestDamages: damages.slice(0, 3), // Show latest 3 damages
      estimatedCompletion:
        inspection.status === "processing" ? new Date(inspection.createdAt + 120000).toISOString() : null, // 2 minutes from start
    }
  },
})

// Update inspection status (for workflow progress)
export const updateInspectionStatus = mutation({
  args: {
    id: v.id("inspections"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"), v.literal("failed")),
    progress: v.optional(
      v.object({
        mediaProcessed: v.number(),
        totalMedia: v.number(),
        currentStep: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
    }

    if (args.status === "complete") {
      updates.completedAt = Date.now()
    }

    if (args.progress) {
      updates.processingProgress = args.progress
    }

    await ctx.db.patch(args.id, updates)

    // Send webhook notification if configured
    const inspection = await ctx.db.get(args.id)
    if (inspection?.processingOptions?.webhookUrl && args.status === "complete") {
      await ctx.scheduler.runAfter(0, api.workflows.sendWebhookNotification, {
        inspectionId: args.id,
        webhookUrl: inspection.processingOptions.webhookUrl,
      })
    }

    return args.id
  },
})

// Batch create damages (for efficient V2 processing)
export const batchCreateDamages = mutation({
  args: {
    inspectionId: v.id("inspections"),
    damages: v.array(
      v.object({
        type: v.string(),
        severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("severe")),
        location: v.string(),
        description: v.string(),
        confidence: v.number(),
        imageId: v.string(),
        boundingBox: v.optional(
          v.object({
            x: v.number(),
            y: v.number(),
            width: v.number(),
            height: v.number(),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const damageIds = []

    for (const damage of args.damages) {
      const damageId = await ctx.db.insert("damages", {
        inspectionId: args.inspectionId,
        ...damage,
      })
      damageIds.push(damageId)
    }

    return damageIds
  },
})
