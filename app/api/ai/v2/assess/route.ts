import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { trackMetric } from "@/lib/observability"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Enhanced request schema with RAG options
const AssessmentRequestSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(10),
  vinNumber: z.string().min(17).max(17),
  shopId: z.string(),
  metadata: z
    .object({
      inspectionId: z.string().optional(),
      timestamp: z.number().optional(),
      useSimilarCases: z.boolean().optional().default(true),
      includeServiceRecommendations: z.boolean().optional().default(true),
    })
    .optional(),
})

const EnhancedAssessmentResponseSchema = z.object({
  success: z.boolean(),
  assessmentId: z.string(),
  vinNumber: z.string(),
  damages: z.array(z.any()),
  embeddings: z.array(z.array(z.number())),
  totalEstimate: z.number(),
  processingTimeMs: z.number(),
  confidence: z.number().min(0).max(1),
  similarCases: z
    .array(
      z.object({
        content: z.string(),
        score: z.number(),
        key: z.string(),
      }),
    )
    .optional(),
  serviceRecommendations: z
    .array(
      z.object({
        procedure: z.string(),
        relevanceScore: z.number(),
        category: z.string(),
      }),
    )
    .optional(),
  metadata: z.object({
    modelVersion: z.string(),
    processedAt: z.string(),
    imageCount: z.number(),
    ollamaLatency: z.number(),
    embeddingLatency: z.number(),
    ragLatency: z.optional(z.number()),
  }),
})

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now()

  try {
    const body = await request.json()
    const validatedRequest = AssessmentRequestSchema.parse(body)

    console.log(
      `[RAG_ASSESS] Processing ${validatedRequest.imageUrls.length} images for VIN: ${validatedRequest.vinNumber}`,
    )

    // Track request
    await trackMetric("ai.rag_assessment_request", 1, {
      imageCount: validatedRequest.imageUrls.length,
      shopId: validatedRequest.shopId,
      useSimilarCases: validatedRequest.metadata?.useSimilarCases || false,
    })

    // 1. Call the original Ollama assessment
    const ollamaResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/v1/assess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrls: validatedRequest.imageUrls,
        vinNumber: validatedRequest.vinNumber,
        metadata: validatedRequest.metadata,
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama assessment failed: ${ollamaResponse.statusText}`)
    }

    const ollamaData = await ollamaResponse.json()

    if (!ollamaData.success) {
      throw new Error(`Ollama assessment error: ${ollamaData.error}`)
    }

    let similarCases: any[] = []
    let serviceRecommendations: any[] = []
    let ragLatency = 0

    // 2. Enhance with RAG if enabled
    if (validatedRequest.metadata?.useSimilarCases) {
      const ragStartTime = Date.now()

      try {
        // Create query text from detected damages
        const damageQuery = ollamaData.damages
          .map((d: any) => `${d.type} ${d.severity} ${d.location} ${d.description}`)
          .join(". ")

        // Get similar past inspections
        const similarCasesResult = await convex.action(api.ragIntegration.getSimilarInspections, {
          shopId: validatedRequest.shopId,
          queryText: damageQuery,
          filters: {
            severity: getMostSevereDamage(ollamaData.damages),
          },
          limit: 5,
        })

        if (similarCasesResult.success) {
          similarCases = similarCasesResult.results
        }

        // Get relevant service procedures if enabled
        if (validatedRequest.metadata?.includeServiceRecommendations) {
          const proceduresResult = await convex.action(api.ragIntegration.getRelevantProcedures, {
            shopId: validatedRequest.shopId,
            queryText: damageQuery,
            limit: 3,
          })

          if (proceduresResult.success) {
            serviceRecommendations = proceduresResult.procedures.map((proc: any) => ({
              procedure: proc.content.substring(0, 200) + "...",
              relevanceScore: proc.score,
              category: extractCategoryFromContent(proc.content),
            }))
          }
        }

        ragLatency = Date.now() - ragStartTime
        console.log(`[RAG_ASSESS] RAG enhancement completed in ${ragLatency}ms`)
      } catch (ragError) {
        console.error("RAG enhancement failed, continuing without:", ragError)
        // Continue without RAG enhancement
      }
    }

    // 3. Build enhanced response
    const enhancedResponse = {
      ...ollamaData,
      similarCases: similarCases.length > 0 ? similarCases : undefined,
      serviceRecommendations: serviceRecommendations.length > 0 ? serviceRecommendations : undefined,
      metadata: {
        ...ollamaData.metadata,
        ragLatency,
      },
    }

    // 4. Store this assessment in RAG for future use
    if (ollamaData.damages.length > 0) {
      try {
        const summaryText = generateInspectionSummary(ollamaData, validatedRequest.vinNumber)

        await convex.action(api.ragIntegration.addInspectionToRag, {
          shopId: validatedRequest.shopId,
          inspectionId: validatedRequest.metadata?.inspectionId || `temp_${Date.now()}`,
          summaryText,
          metadata: {
            vinNumber: validatedRequest.vinNumber,
            damageTypes: ollamaData.damages.map((d: any) => d.type),
            totalCost: ollamaData.totalEstimate,
            severity: getMostSevereDamage(ollamaData.damages),
          },
        })
      } catch (storageError) {
        console.error("Failed to store assessment in RAG:", storageError)
        // Don't fail the request for storage errors
      }
    }

    const totalProcessingTime = Date.now() - requestStartTime

    // Track successful completion
    await trackMetric("ai.rag_assessment_success", 1, {
      processingTime: totalProcessingTime,
      damageCount: ollamaData.damages.length,
      similarCasesFound: similarCases.length,
      serviceRecommendations: serviceRecommendations.length,
    })

    const validatedResponse = EnhancedAssessmentResponseSchema.parse({
      ...enhancedResponse,
      processingTimeMs: totalProcessingTime,
    })

    return NextResponse.json(validatedResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": totalProcessingTime.toString(),
        "X-RAG-Enhanced": "true",
        "X-Similar-Cases": similarCases.length.toString(),
      },
    })
  } catch (error) {
    const totalProcessingTime = Date.now() - requestStartTime

    console.error("[RAG_ASSESS] Enhanced assessment failed:", error)

    await trackMetric("ai.rag_assessment_error", 1, {
      processingTime: totalProcessingTime,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    Sentry.captureException(error, {
      tags: {
        endpoint: "/api/ai/v2/assess",
        processingTime: totalProcessingTime,
      },
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: error.errors,
          processingTimeMs: totalProcessingTime,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during RAG-enhanced assessment",
        processingTimeMs: totalProcessingTime,
      },
      { status: 500 },
    )
  }
}

// Helper functions
function getMostSevereDamage(damages: any[]): string {
  const severityOrder = { minor: 1, moderate: 2, severe: 3 }
  return damages.reduce((most, current) => {
    const currentLevel = severityOrder[current.severity as keyof typeof severityOrder] || 1
    const mostLevel = severityOrder[most as keyof typeof severityOrder] || 1
    return currentLevel > mostLevel ? current.severity : most
  }, "minor")
}

function extractCategoryFromContent(content: string): string {
  const categories = ["paint_correction", "leather_care", "glass_repair", "detailing", "body_work"]
  const lowerContent = content.toLowerCase()

  for (const category of categories) {
    if (lowerContent.includes(category.replace("_", " "))) {
      return category
    }
  }

  return "general"
}

function generateInspectionSummary(assessmentData: any, vinNumber: string): string {
  const damages = assessmentData.damages
  const totalCost = assessmentData.totalEstimate

  let summary = `Vehicle Inspection Summary for VIN: ${vinNumber}\n\n`
  summary += `Total Estimated Cost: $${totalCost}\n`
  summary += `Overall Confidence: ${(assessmentData.confidence * 100).toFixed(1)}%\n\n`

  summary += "Damages Detected:\n"
  damages.forEach((damage: any, index: number) => {
    summary += `${index + 1}. ${damage.type} (${damage.severity}) at ${damage.location}\n`
    summary += `   Description: ${damage.description}\n`
    summary += `   Confidence: ${(damage.confidence * 100).toFixed(1)}%\n\n`
  })

  return summary
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "rag-enhanced-ai-assessment",
    version: "2.0.0",
    features: {
      similarCaseRetrieval: true,
      serviceRecommendations: true,
      knowledgeStorage: true,
    },
    timestamp: new Date().toISOString(),
  })
}
