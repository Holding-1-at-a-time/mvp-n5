import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

export const enqueueProcessInspection = mutation({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    // Update status to processing
    await ctx.db.patch(args.inspectionId, { status: "processing" })

    // Schedule the processing workflow
    await ctx.scheduler.runAfter(0, api.workflows.processInspection, {
      inspectionId: args.inspectionId,
    })
  },
})

export const processInspection = mutation({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    try {
      const inspection = await ctx.db.get(args.inspectionId)
      if (!inspection) throw new Error("Inspection not found")

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Call stubbed AI assessment endpoint
      const assessmentResult = await callAIAssessment(inspection.imageIds)

      // Persist damage records
      const damageIds = []
      for (const damage of assessmentResult.damages) {
        const damageId = await ctx.db.insert("damages", {
          inspectionId: args.inspectionId,
          type: damage.type,
          severity: damage.severity,
          location: damage.location,
          description: damage.description,
          confidence: damage.confidence,
          imageId: damage.imageId,
          boundingBox: damage.boundingBox,
        })
        damageIds.push(damageId)
      }

      // Persist estimate items
      for (let i = 0; i < assessmentResult.estimates.length; i++) {
        const estimate = assessmentResult.estimates[i]
        await ctx.db.insert("estimateItems", {
          inspectionId: args.inspectionId,
          damageId: damageIds[i] || damageIds[0],
          description: estimate.description,
          laborHours: estimate.laborHours,
          laborRate: estimate.laborRate,
          partsCost: estimate.partsCost,
          totalCost: estimate.totalCost,
          category: estimate.category,
        })
      }

      // Update inspection status to complete
      await ctx.db.patch(args.inspectionId, {
        status: "complete",
        completedAt: Date.now(),
      })
    } catch (error) {
      console.error("Processing failed:", error)
      await ctx.db.patch(args.inspectionId, { status: "failed" })
    }
  },
})

// Stubbed AI assessment function
async function callAIAssessment(imageIds: string[]) {
  // This would normally call /ai/v1/assess endpoint
  // For now, return fixture data
  return {
    damages: [
      {
        type: "dent",
        severity: "moderate" as const,
        location: "front_bumper",
        description: "Medium-sized dent on front bumper",
        confidence: 0.85,
        imageId: imageIds[0],
        boundingBox: { x: 100, y: 150, width: 80, height: 60 },
      },
      {
        type: "scratch",
        severity: "minor" as const,
        location: "driver_door",
        description: "Surface scratch on driver side door",
        confidence: 0.92,
        imageId: imageIds[1],
        boundingBox: { x: 200, y: 300, width: 120, height: 20 },
      },
    ],
    estimates: [
      {
        description: "Front bumper dent repair",
        laborHours: 3,
        laborRate: 85,
        partsCost: 150,
        totalCost: 405,
        category: "body_work",
      },
      {
        description: "Door scratch touch-up",
        laborHours: 1,
        laborRate: 85,
        partsCost: 45,
        totalCost: 130,
        category: "paint_work",
      },
    ],
  }
}
