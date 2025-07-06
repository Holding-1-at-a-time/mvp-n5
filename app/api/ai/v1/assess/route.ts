import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { trackMetric } from "@/lib/observability"
import { Buffer } from "buffer"

// Environment configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "llama3.2-vision"
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "mxbai-embed-large"

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

// Ollama client functions
async function callOllamaVision(imageBuffers: Buffer[], prompt: string): Promise<any> {
  const startTime = Date.now()

  try {
    const payload = {
      model: VISION_MODEL,
      prompt: prompt,
      images: imageBuffers.map((buffer) => buffer.toString("base64")),
      stream: false,
      options: {
        temperature: 0.1, // Low temperature for consistent results
        top_p: 0.9,
      },
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Ollama Vision API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    const latency = Date.now() - startTime

    // Track vision model latency
    await trackMetric("ai.vision_latency", latency, {
      model: VISION_MODEL,
      imageCount: imageBuffers.length,
    })

    return {
      response: result.response,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    await trackMetric("ai.vision_error", 1, {
      model: VISION_MODEL,
      error: error instanceof Error ? error.message : "Unknown error",
      latency,
    })
    throw error
  }
}

async function generateEmbeddings(texts: string[]): Promise<{ embeddings: number[][]; latency: number }> {
  const startTime = Date.now()

  try {
    const payload = {
      model: EMBED_MODEL,
      prompt: texts.join("\n"), // Combine texts for batch processing
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Ollama Embeddings API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    const latency = Date.now() - startTime

    // Track embedding latency
    await trackMetric("ai.embedding_latency", latency, {
      model: EMBED_MODEL,
      textCount: texts.length,
    })

    // Handle both single and batch embedding responses
    const embeddings = Array.isArray(result.embedding[0]) ? result.embedding : [result.embedding]

    return {
      embeddings,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    await trackMetric("ai.embedding_error", 1, {
      model: EMBED_MODEL,
      error: error instanceof Error ? error.message : "Unknown error",
      latency,
    })
    throw error
  }
}

async function fetchImageBuffers(imageUrls: string[]): Promise<Buffer[]> {
  const buffers = await Promise.all(
    imageUrls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        return Buffer.from(arrayBuffer)
      } catch (error) {
        console.error(`Failed to fetch image from ${url}:`, error)
        throw new Error(`Image fetch failed: ${url}`)
      }
    }),
  )
  return buffers
}

function parseDamageResponse(responseText: string, imageUrls: string[]): any[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const damages = JSON.parse(jsonMatch[0])
      return damages.map((damage: any, index: number) => ({
        id: `damage_${Date.now()}_${index}`,
        type: mapDamageType(damage.type || damage.damage_type || "unknown"),
        severity: mapSeverity(damage.severity || "moderate"),
        location: damage.location || "unknown",
        description: damage.description || `${damage.type} detected`,
        confidence: Math.min(Math.max(damage.confidence || 0.8, 0), 1),
        imageUrl: imageUrls[Math.floor(index / 2)] || imageUrls[0], // Distribute across images
        boundingBox: {
          x: damage.bbox?.[0] || damage.x || 0,
          y: damage.bbox?.[1] || damage.y || 0,
          width: damage.bbox?.[2] || damage.width || 100,
          height: damage.bbox?.[3] || damage.height || 100,
        },
      }))
    }

    // Fallback: parse text response for damage mentions
    return parseTextualDamageResponse(responseText, imageUrls)
  } catch (error) {
    console.error("Failed to parse damage response:", error)
    return parseTextualDamageResponse(responseText, imageUrls)
  }
}

function parseTextualDamageResponse(text: string, imageUrls: string[]): any[] {
  const damages = []
  const damageKeywords = ["dent", "scratch", "crack", "rust", "paint damage", "glass damage"]
  const severityKeywords = ["minor", "moderate", "major", "severe", "significant"]

  const lines = text.split("\n")
  let damageIndex = 0

  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    const foundDamage = damageKeywords.find((keyword) => lowerLine.includes(keyword))

    if (foundDamage) {
      const foundSeverity = severityKeywords.find((keyword) => lowerLine.includes(keyword)) || "moderate"

      damages.push({
        id: `damage_${Date.now()}_${damageIndex}`,
        type: mapDamageType(foundDamage),
        severity: mapSeverity(foundSeverity),
        location: extractLocation(line) || "vehicle body",
        description: line.trim(),
        confidence: 0.75, // Default confidence for text parsing
        imageUrl: imageUrls[damageIndex % imageUrls.length],
        boundingBox: {
          x: Math.floor(Math.random() * 200) + 50,
          y: Math.floor(Math.random() * 200) + 50,
          width: Math.floor(Math.random() * 100) + 50,
          height: Math.floor(Math.random() * 80) + 40,
        },
      })
      damageIndex++
    }
  }

  return damages
}

function mapDamageType(type: string): string {
  const typeMap: Record<string, string> = {
    dent: "dent",
    scratch: "scratch",
    crack: "crack",
    rust: "rust",
    "paint damage": "paint_damage",
    paint_damage: "paint_damage",
    "glass damage": "glass_damage",
    glass_damage: "glass_damage",
    unknown: "scratch", // Default fallback
  }
  return typeMap[type.toLowerCase()] || "scratch"
}

function mapSeverity(severity: string): string {
  const severityMap: Record<string, string> = {
    minor: "minor",
    moderate: "moderate",
    major: "severe",
    severe: "severe",
    significant: "severe",
  }
  return severityMap[severity.toLowerCase()] || "moderate"
}

function extractLocation(text: string): string | null {
  const locationKeywords = [
    "bumper",
    "door",
    "hood",
    "trunk",
    "fender",
    "panel",
    "windshield",
    "window",
    "mirror",
    "headlight",
    "taillight",
    "roof",
    "side",
  ]

  const lowerText = text.toLowerCase()
  const foundLocation = locationKeywords.find((keyword) => lowerText.includes(keyword))
  return foundLocation || null
}

function generateEstimateItems(damages: any[]): any[] {
  return damages.map((damage, index) => {
    const laborHours = damage.severity === "minor" ? 1 : damage.severity === "moderate" ? 3 : 6
    const laborRate = 85 + Math.floor(Math.random() * 30) // $85-115/hour
    const partsCost = damage.type === "dent" ? 50 + Math.random() * 200 : 25 + Math.random() * 100

    return {
      id: `estimate_${index + 1}_${Date.now()}`,
      damageId: damage.id,
      description: `Repair ${damage.type} on ${damage.location.replace("_", " ")}`,
      laborHours,
      laborRate,
      partsCost: Math.round(partsCost),
      totalCost: Math.round(laborHours * laborRate + partsCost),
      category: damage.type === "glass_damage" ? "glass_repair" : "body_work",
      priority: damage.severity === "severe" ? "high" : damage.severity === "moderate" ? "medium" : "low",
    }
  })
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now()

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

    // 1. Fetch image buffers
    const imageBuffers = await fetchImageBuffers(validatedRequest.imageUrls)
    console.log(`[OLLAMA_ASSESS] Fetched ${imageBuffers.length} image buffers`)

    // 2. Call Ollama Vision for damage detection
    const visionPrompt = `
Analyze these vehicle photos for damage assessment. Look for:
- Dents, scratches, cracks, rust, paint damage, glass damage
- Assess severity as minor, moderate, or severe
- Identify specific locations on the vehicle
- Provide confidence scores

Return your findings as a JSON array with this structure:
[
  {
    "type": "dent|scratch|crack|rust|paint_damage|glass_damage",
    "severity": "minor|moderate|severe",
    "location": "specific location on vehicle",
    "description": "detailed description",
    "confidence": 0.85,
    "bbox": [x, y, width, height]
  }
]

If no damage is found, return an empty array [].
`

    const visionResult = await callOllamaVision(imageBuffers, visionPrompt)
    console.log(`[OLLAMA_ASSESS] Vision analysis completed in ${visionResult.latency}ms`)

    // 3. Parse damage response
    const damages = parseDamageResponse(visionResult.response, validatedRequest.imageUrls)
    console.log(`[OLLAMA_ASSESS] Detected ${damages.length} damages`)

    // 4. Generate embeddings for damage descriptions
    let embeddings: number[][] = []
    let embeddingLatency = 0

    if (damages.length > 0) {
      const damageTexts = damages.map((d) => `${d.type} ${d.severity} ${d.description}`)
      const embeddingResult = await generateEmbeddings(damageTexts)
      embeddings = embeddingResult.embeddings
      embeddingLatency = embeddingResult.latency

      // Add embeddings to damage objects
      damages.forEach((damage, index) => {
        if (embeddings[index]) {
          damage.embedding = embeddings[index]
        }
      })

      console.log(`[OLLAMA_ASSESS] Generated ${embeddings.length} embeddings in ${embeddingLatency}ms`)
    }

    // 5. Generate estimate items
    const estimateItems = generateEstimateItems(damages)
    const totalEstimate = estimateItems.reduce((sum, item) => sum + item.totalCost, 0)

    // 6. Calculate overall confidence
    const overallConfidence =
      damages.length > 0 ? damages.reduce((sum, d) => sum + d.confidence, 0) / damages.length : 1.0

    // 7. Build response
    const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const totalProcessingTime = Date.now() - requestStartTime

    const response = {
      success: true,
      assessmentId,
      vinNumber: validatedRequest.vinNumber,
      damages,
      embeddings,
      totalEstimate: Math.round(totalEstimate),
      processingTimeMs: totalProcessingTime,
      confidence: Math.round(overallConfidence * 100) / 100,
      metadata: {
        modelVersion: `${VISION_MODEL}+${EMBED_MODEL}`,
        processedAt: new Date().toISOString(),
        imageCount: validatedRequest.imageUrls.length,
        ollamaLatency: visionResult.latency,
        embeddingLatency,
      },
    }

    // Validate response schema
    const validatedResponse = AssessmentResponseSchema.parse(response)

    // Track successful completion
    await trackMetric("ai.assessment_success", 1, {
      processingTime: totalProcessingTime,
      damageCount: damages.length,
      confidence: overallConfidence,
    })

    console.log(`[OLLAMA_ASSESS] Assessment completed in ${totalProcessingTime}ms`)

    return NextResponse.json(validatedResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": totalProcessingTime.toString(),
        "X-Model-Version": `${VISION_MODEL}+${EMBED_MODEL}`,
        "X-Damage-Count": damages.length.toString(),
      },
    })
  } catch (error) {
    const totalProcessingTime = Date.now() - requestStartTime

    console.error("[OLLAMA_ASSESS] Assessment failed:", error)

    // Track error
    await trackMetric("ai.assessment_error", 1, {
      processingTime: totalProcessingTime,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    // Report error to Sentry with context
    Sentry.captureException(error, {
      tags: {
        endpoint: "/api/ai/v1/assess",
        processingTime: totalProcessingTime,
      },
      extra: {
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
        error: "Internal server error during assessment",
        processingTimeMs: totalProcessingTime,
      },
      { status: 500 },
    )
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
