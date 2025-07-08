import { action, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

// Analyze inspection using AI
export const analyzeInspection = action({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    const inspection = await ctx.runQuery(api.inspections.get, { id: args.inspectionId })
    if (!inspection) throw new Error("Inspection not found")

    // Get inspection images
    const attachments = await ctx.runQuery(api.attachments.list, {
      entityType: "inspections",
      entityId: args.inspectionId,
    })

    const imageAttachments = attachments.filter((a) => a.fileType?.startsWith("image/"))

    if (imageAttachments.length === 0) {
      await ctx.runMutation(api.ai.updateAnalysisStatus, {
        inspectionId: args.inspectionId,
        status: "completed",
        confidence: 0,
        findings: [],
        error: "No images found for analysis",
      })
      return
    }

    try {
      // Update status to processing
      await ctx.runMutation(api.ai.updateAnalysisStatus, {
        inspectionId: args.inspectionId,
        status: "processing",
        confidence: 0,
        findings: [],
      })

      // Process each image (mock AI analysis)
      const findings = []
      let totalConfidence = 0

      for (const attachment of imageAttachments) {
        // Mock AI analysis - in real implementation, call your AI service
        const mockAnalysis = {
          damageType: Math.random() > 0.7 ? "scratch" : Math.random() > 0.5 ? "dent" : "none",
          severity: Math.random() > 0.8 ? "high" : Math.random() > 0.6 ? "medium" : "low",
          confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
          location: "front_bumper",
          description: "AI detected potential damage",
        }

        if (mockAnalysis.damageType !== "none") {
          findings.push({
            attachmentId: attachment._id,
            damageType: mockAnalysis.damageType,
            severity: mockAnalysis.severity,
            confidence: mockAnalysis.confidence,
            location: mockAnalysis.location,
            description: mockAnalysis.description,
            boundingBox: {
              x: Math.floor(Math.random() * 400),
              y: Math.floor(Math.random() * 300),
              width: Math.floor(Math.random() * 100) + 50,
              height: Math.floor(Math.random() * 100) + 50,
            },
          })
        }

        totalConfidence += mockAnalysis.confidence
      }

      const avgConfidence = totalConfidence / imageAttachments.length

      // Store analysis results
      await ctx.runMutation(api.ai.updateAnalysisStatus, {
        inspectionId: args.inspectionId,
        status: "completed",
        confidence: avgConfidence,
        findings,
      })

      // Create damage analysis record for vector search
      if (findings.length > 0) {
        const report = findings
          .map((f) => `${f.damageType} damage detected on ${f.location} with ${f.severity} severity`)
          .join(". ")

        // Mock embedding generation - in real implementation, call embedding service
        const embedding = Array.from({ length: 1536 }, () => Math.random() - 0.5)

        await ctx.runMutation(api.ai.createDamageAnalysis, {
          shopId: inspection.shopId,
          inspectionId: args.inspectionId,
          report,
          embedding,
        })
      }
    } catch (error) {
      await ctx.runMutation(api.ai.updateAnalysisStatus, {
        inspectionId: args.inspectionId,
        status: "failed",
        confidence: 0,
        findings: [],
        error: error.message,
      })
    }
  },
})

// Update AI analysis status
export const updateAnalysisStatus = mutation({
  args: {
    inspectionId: v.id("inspections"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    confidence: v.number(),
    findings: v.array(
      v.object({
        attachmentId: v.id("attachments"),
        damageType: v.string(),
        severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        confidence: v.number(),
        location: v.string(),
        description: v.string(),
        boundingBox: v.object({
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
        }),
      }),
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inspection = await ctx.db.get(args.inspectionId)
    if (!inspection) throw new Error("Inspection not found")

    await ctx.db.patch(args.inspectionId, {
      aiAnalysis: {
        status: args.status,
        confidence: args.confidence,
        findings: args.findings,
        error: args.error,
        analyzedAt: Date.now(),
      },
    })

    return { success: true }
  },
})

// Create damage analysis for vector search
export const createDamageAnalysis = mutation({
  args: {
    shopId: v.id("shops"),
    inspectionId: v.id("inspections"),
    report: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("damageAnalyses", args)
    return analysisId
  },
})

// Search similar damage analyses
export const searchSimilarDamage = action({
  args: {
    shopId: v.id("shops"),
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("damageAnalyses", "by_embedding", {
      vector: args.embedding,
      limit: args.limit || 10,
      filter: (q) => q.eq("shopId", args.shopId),
    })

    return results
  },
})

// Get AI model performance metrics
export const getModelMetrics = query({
  args: {
    shopId: v.id("shops"),
    modelVersion: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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

    const inspections = await ctx.db
      .query("inspections")
      .withIndex("by_shop_date", (q) => q.eq("shopId", args.shopId))
      .filter((q) => q.neq(q.field("aiAnalysis.status"), "pending"))
      .collect()

    const filteredInspections = inspections.filter((i) => {
      if (args.startDate && i.scheduledDate < args.startDate) return false
      if (args.endDate && i.scheduledDate > args.endDate) return false
      return true
    })

    const metrics = {
      totalAnalyses: filteredInspections.length,
      successful: filteredInspections.filter((i) => i.aiAnalysis?.status === "completed").length,
      failed: filteredInspections.filter((i) => i.aiAnalysis?.status === "failed").length,
      averageConfidence:
        filteredInspections
          .filter((i) => i.aiAnalysis?.status === "completed")
          .reduce((sum, i) => sum + (i.aiAnalysis?.confidence || 0), 0) /
          filteredInspections.filter((i) => i.aiAnalysis?.status === "completed").length || 0,
      damageDetectionRate:
        filteredInspections.filter((i) => i.aiAnalysis?.status === "completed" && i.aiAnalysis?.findings?.length > 0)
          .length / filteredInspections.filter((i) => i.aiAnalysis?.status === "completed").length || 0,
    }

    return metrics
  },
})
