import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { trackMetric } from "@/lib/observability"
import { generateObject } from "ai"
import { ollama } from "@ai-sdk/ollama"
import { env } from "@/lib/env"
import { trackApiCall } from "@/lib/observability"

// Environment configuration
const OLLAMA_BASE_URL = env.OLLAMA_BASE_URL || "http://localhost:11434"
const VISION_MODEL = env.OLLAMA_VISION_MODEL || "llama3.2-vision"
const EMBED_MODEL = env.OLLAMA_EMBED_MODEL || "mxbai-embed-large"

// Request schema validation
const AssessmentRequestSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(10),
  vinNumber: z.string().min(17).max(17),
  metadata: z
    .object({
      inspectionId: z.string().optional(),
      timestamp: z.number().optional(),
    })
    .optional(),
})

// Response schema for validation
const DamageSchema = z.object({
  id: z.string(),
  type: z.enum(["dent", "scratch", "crack", "rust", "paint_damage", "glass_damage"]),
  severity: z.enum(["minor", "moderate", "severe"]),
  location: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  imageUrl: z.string().url(),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  embedding: z.array(z.number()).optional(),
})

const EstimateItemSchema = z.object({
  id: z.string(),
  damageId: z.string(),
  description: z.string(),
  laborHours: z.number().min(0),
  laborRate: z.number().min(0),
  partsCost: z.number().min(0),
  totalCost: z.number().min(0),
  category: z.enum(["body_work", "paint_work", "glass_repair", "mechanical"]),
  priority: z.enum(["low", "medium", "high"]),
})

const AssessmentResponseSchema = z.object({
  success: z.boolean(),
  assessmentId: z.string(),
  vinNumber: z.string(),
  damages: z.array(DamageSchema),
  embeddings: z.array(z.array(z.number())),
  totalEstimate: z.number(),
  processingTimeMs: z.number(),
  confidence: z.number().min(0).max(1),
  metadata: z.object({
    modelVersion: z.string(),
    processedAt: z.string(),
    imageCount: z.number(),
    ollamaLatency: z.number(),
    embeddingLatency: z.number(),
  }),
})

// Define the schema for the AI assessment response
const assessmentSchema = z.object({
  damage: z
    .array(
      z.object({
        type: z.string().describe("Type of damage (e.g., 'dent', 'scratch', 'paint chip')"),
        location: z
          .string()
          .describe("Specific location on the vehicle (e.g., 'front bumper', 'driver door', 'rear quarter panel')"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity of the damage"),
        description: z.string().describe("Detailed description of the damage"),
        estimatedRepairCost: z.number().describe("Estimated cost to repair this specific damage in USD"),
      }),
    )
    .describe("Array of detected damages"),
  overallCondition: z.enum(["excellent", "good", "fair", "poor"]).describe("Overall condition of the vehicle"),
  recommendations: z.array(z.string()).describe("Recommended repair actions or next steps"),
  totalEstimatedCost: z.number().describe("Total estimated cost for all detected repairs in USD"),
})

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now()
  let status = "success"
  let errorMessage = ""

  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedRequest = AssessmentRequestSchema.parse(body)

    console.log(
      `[OLLAMA_ASSESS] Processing ${validatedRequest.imageUrls.length} images for VIN: ${validatedRequest.vinNumber}`,
    )

    // Track request
    await trackMetric("ai.assessment_request", 1, {
      imageCount: validatedRequest.imageUrls.length,
      vinNumber: validatedRequest.vinNumber,
    })

    const model = ollama(OLLAMA_BASE_URL).chat(VISION_MODEL)

    const prompt = `
      You are an expert vehicle damage assessor. Analyze the provided images of a vehicle with VIN ${validatedRequest.vinNumber}.
      Identify all visible damages, their type, precise location, severity (low, medium, high), and provide a brief description.
      Estimate the repair cost for each individual damage in USD.
      Finally, provide an overall condition assessment and general repair recommendations.

      Consider the following for severity and cost:
      - Low: Minor cosmetic issues, easily fixable, e.g., light scratches, small chips.
      - Medium: Noticeable damage requiring professional attention, e.g., small dents, deep scratches, minor paint damage.
      - High: Significant damage affecting appearance or function, e.g., large dents, structural damage, extensive paint damage, broken parts.

      Provide the output in a structured JSON format according to the schema.
    `

    const { object: assessment } = await generateObject({
      model: model,
      prompt: prompt,
      schema: assessmentSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...validatedRequest.imageUrls.map((url: string) => ({ type: "image" as const, image: url })),
          ],
        },
      ],
    })

    return NextResponse.json(assessment)
  } catch (error: any) {
    console.error("AI assessment failed:", error)
    status = "error"
    errorMessage = error.message || "Internal server error during AI assessment."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    trackApiCall("ai_assessment_v1", Date.now() - requestStartTime, status, errorMessage)
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test Ollama connection
    const healthResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    const isOllamaHealthy = healthResponse.ok

    return NextResponse.json({
      status: isOllamaHealthy ? "healthy" : "degraded",
      service: "ollama-ai-assessment",
      version: "2.0.0",
      models: {
        vision: VISION_MODEL,
        embedding: EMBED_MODEL,
      },
      ollama: {
        url: OLLAMA_BASE_URL,
        healthy: isOllamaHealthy,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "ollama-ai-assessment",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
