import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  inspections: defineTable({
    vinNumber: v.string(),
    imageIds: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"), v.literal("failed")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        make: v.optional(v.string()),
        model: v.optional(v.string()),
        year: v.optional(v.number()),
      }),
    ),
  }),

  damages: defineTable({
    inspectionId: v.id("inspections"),
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

  estimateItems: defineTable({
    inspectionId: v.id("inspections"),
    damageId: v.id("damages"),
    description: v.string(),
    laborHours: v.number(),
    laborRate: v.number(),
    partsCost: v.number(),
    totalCost: v.number(),
    category: v.string(),
  }),

  files: defineTable({
    storageId: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
  }),
})
