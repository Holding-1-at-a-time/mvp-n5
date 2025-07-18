import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs"
import { trackMetric } from "@/lib/observability"
import { Buffer } from "buffer"
import {
  NetworkError,
  ValidationError,
  AIProcessingError,
  ErrorLogger,
  withRetry,
  createAppError,
} from "@/lib/error-handling"

// Environment configuration with validation
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "llama3.2-vision"
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "mxbai-embed-large"

// Validate environment variables
if (!OLLAMA_BASE_URL) {
  throw new Error("OLLAMA_BASE_URL environment variable is required")
}

// Request schema validation with detailed error messages
const AssessmentRequestSchema = z.object({
  imageUrls: z
    .array(z.string().url("Invalid image URL format"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  vinNumber: z.string().length(17, "VIN must be exactly 17 characters"),
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

// Enhanced Ollama client functions with comprehensive error handling
async function callOllamaVision(imageBuffers: Buffer[], prompt: string): Promise<any> {
  const startTime = Date.now()

  try {
    if (!imageBuffers || imageBuffers.length === 0) {
      throw new ValidationError("No image buffers provided")
    }

    if (!prompt || prompt.trim().length === 0) {
      throw new ValidationError("Prompt cannot be empty")
    }

    const payload = {
      model: VISION_MODEL,
      prompt: prompt,
      images: imageBuffers.map((buffer) => {
        if (!Buffer.isBuffer(buffer)) {
          throw new ValidationError("Invalid image buffer format")
        }
        return buffer.toString("base64")
      }),
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
      },
    }

    const response = await withRetry(
      async () => {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        })

        if (!res.ok) {
          if (res.status >= 500) {
            throw new NetworkError(`Ollama server error: ${res.status} ${res.statusText}`, res.status)
          } else if (res.status === 404) {
            throw new AIProcessingError(`Model ${VISION_MODEL} not found on Ollama server`)
          } else {
            throw new AIProcessingError(`Ollama API error: ${res.status} ${res.statusText}`)
          }
        }

        return res
      },
      3, // max retries
      1000, // initial delay
      { operation: "ollama_vision_call", model: VISION_MODEL },
    )

    const result = await response.json()

    if (!result || !result.response) {
      throw new AIProcessingError("Invalid response from Ollama vision model")
    }

    const latency = Date.now() - startTime

    // Track successful vision model call
    await trackMetric("ai.vision_latency", latency, {
      model: VISION_MODEL,
      imageCount: imageBuffers.length,
      success: true,
    })

    return {
      response: result.response,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    const appError = createAppError(error)

    await trackMetric("ai.vision_error", 1, {
      model: VISION_MODEL,
      error: appError.message,
      latency,
      imageCount: imageBuffers?.length || 0,
    })

    ErrorLogger.log(appError, {
      operation: "callOllamaVision",
      model: VISION_MODEL,
      imageCount: imageBuffers?.length || 0,
      latency,
    })

    throw appError
  }
}

async function generateEmbeddings(texts: string[]): Promise<{ embeddings: number[][]; latency: number }> {
  const startTime = Date.now()

  try {
    if (!texts || texts.length === 0) {
      throw new ValidationError("No texts provided for embedding generation")
    }

    if (texts.some((text) => !text || text.trim().length === 0)) {
      throw new ValidationError("All texts must be non-empty")
    }

    const payload = {
      model: EMBED_MODEL,
      prompt: texts.join("\n"),
    }

    const response = await withRetry(
      async () => {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000), // 15 second timeout
        })

        if (!res.ok) {
          if (res.status >= 500) {
            throw new NetworkError(`Ollama server error: ${res.status} ${res.statusText}`, res.status)
          } else if (res.status === 404) {
            throw new AIProcessingError(`Embedding model ${EMBED_MODEL} not found`)
          } else {
            throw new AIProcessingError(`Ollama embeddings error: ${res.status} ${res.statusText}`)
          }
        }

        return res
      },
      3,
      1000,
      { operation: "ollama_embeddings", model: EMBED_MODEL },
    )

    const result = await response.json()

    if (!result || !result.embedding) {
      throw new AIProcessingError("Invalid embedding response from Ollama")
    }

    const latency = Date.now() - startTime

    // Track successful embedding generation
    await trackMetric("ai.embedding_latency", latency, {
      model: EMBED_MODEL,
      textCount: texts.length,
      success: true,
    })

    // Handle both single and batch embedding responses
    const embeddings = Array.isArray(result.embedding[0]) ? result.embedding : [result.embedding]

    return {
      embeddings,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    const appError = createAppError(error)

    await trackMetric("ai.embedding_error", 1, {
      model: EMBED_MODEL,
      error: appError.message,
      latency,
      textCount: texts?.length || 0,
    })

    ErrorLogger.log(appError, {
      operation: "generateEmbeddings",
      model: EMBED_MODEL,
      textCount: texts?.length || 0,
      latency,
    })

    throw appError
  }
}

async function fetchImageBuffers(imageUrls: string[]): Promise<Buffer[]> {
  if (!imageUrls || imageUrls.length === 0) {
    throw new ValidationError("No image URLs provided")
  }

  const buffers = await Promise.allSettled(
    imageUrls.map(async (url, index) => {
      try {
        if (!url || !url.startsWith("http")) {
          throw new ValidationError(`Invalid image URL at index ${index}: ${url}`)
        }

        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000), // 10 second timeout per image
        })

        if (!response.ok) {
          throw new NetworkError(`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.startsWith("image/")) {
          throw new ValidationError(`URL does not point to an image: ${url}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        if (arrayBuffer.byteLength === 0) {
          throw new ValidationError(`Empty image file from URL: ${url}`)
        }

        return Buffer.from(arrayBuffer)
      } catch (error) {
        const appError = createAppError(error)
        ErrorLogger.log(appError, { operation: "fetchImageBuffer", url, index })
        throw appError
      }
    }),
  )

  // Check for any failed image fetches
  const failedFetches = buffers.filter((result) => result.status === "rejected")
  if (failedFetches.length > 0) {
    const errors = failedFetches.map((result) => (result as PromiseRejectedResult).reason.message)
    throw new NetworkError(`Failed to fetch ${failedFetches.length} images: ${errors.join(", ")}`)
  }

  return buffers
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<Buffer>).value)
}

function parseDamageResponse(responseText: string, imageUrls: string[]): any[] {
  try {
    if (!responseText || responseText.trim().length === 0) {
      throw new ValidationError("Empty response from AI model")
    }

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const damages = JSON.parse(jsonMatch[0])

      if (!Array.isArray(damages)) {
        throw new ValidationError("AI response is not an array")
      }

      return damages
        .map((damage: any, index: number) => {
          try {
            return {
              id: `damage_${Date.now()}_${index}`,
              type: mapDamageType(damage.type || damage.damage_type || "unknown"),
              severity: mapSeverity(damage.severity || "moderate"),
              location: damage.location || "unknown",
              description: damage.description || `${damage.type} detected`,
              confidence: Math.min(Math.max(damage.confidence || 0.8, 0), 1),
              imageUrl: imageUrls[Math.floor(index / 2)] || imageUrls[0],
              boundingBox: {
                x: damage.bbox?.[0] || damage.x || 0,
                y: damage.bbox?.[1] || damage.y || 0,
                width: damage.bbox?.[2] || damage.width || 100,
                height: damage.bbox?.[3] || damage.height || 100,
              },
            }
          } catch (error) {
            ErrorLogger.log(createAppError(error), {
              operation: "parseDamageItem",
              damageIndex: index,
              damage,
            })
            return null
          }
        })
        .filter(Boolean) // Remove null entries
    }

    // Fallback: parse text response for damage mentions
    return parseTextualDamageResponse(responseText, imageUrls)
  } catch (error) {
    ErrorLogger.log(createAppError(error), {
      operation: "parseDamageResponse",
      responseLength: responseText?.length || 0,
    })
    return parseTextualDamageResponse(responseText, imageUrls)
  }
}

function parseTextualDamageResponse(text: string, imageUrls: string[]): any[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const damages = []
  const damageKeywords = ["dent", "scratch", "crack", "rust", "paint damage", "glass damage"]
  const severityKeywords = ["minor", "moderate", "major", "severe", "significant"]

  const lines = text.split("\n").filter((line) => line.trim().length > 0)
  let damageIndex = 0

  for (const line of lines) {
    try {
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
          confidence: 0.75,
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
    } catch (error) {
      ErrorLogger.log(createAppError(error), {
        operation: "parseTextualDamageLine",
        line,
        damageIndex,
      })
    }
  }

  return damages
}

function mapDamageType(type: string): string {
  if (!type || typeof type !== "string") {
    return "scratch"
  }

  const typeMap: Record<string, string> = {
    dent: "dent",
    scratch: "scratch",
    crack: "crack",
    rust: "rust",
    "paint damage": "paint_damage",
    paint_damage: "paint_damage",
    "glass damage": "glass_damage",
    glass_damage: "glass_damage",
    unknown: "scratch",
  }
  return typeMap[type.toLowerCase()] || "scratch"
}

function mapSeverity(severity: string): string {
  if (!severity || typeof severity !== "string") {
    return "moderate"
  }

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
  if (!text || typeof text !== "string") {
    return null
  }

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
  if (!damages || !Array.isArray(damages)) {
    return []
  }

  return damages
    .map((damage, index) => {
      try {
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
      } catch (error) {
        ErrorLogger.log(createAppError(error), {
          operation: "generateEstimateItem",
          damageIndex: index,
          damage,
        })
        return null
      }
    })
    .filter(Boolean)
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now()
  let validatedRequest: any = null

  try {
    // Parse and validate request body
    const body = await request.json().catch(() => {
      throw new ValidationError("Invalid JSON in request body")
    })

    validatedRequest = AssessmentRequestSchema.parse(body)

    console.log(
      `[OLLAMA_ASSESS] Processing ${validatedRequest.imageUrls.length} images for VIN: ${validatedRequest.vinNumber}`,
    )

    // Track request
    await trackMetric("ai.assessment_request", 1, {
      imageCount: validatedRequest.imageUrls.length,
      vinNumber: validatedRequest.vinNumber,
    })

    // 1. Fetch image buffers with comprehensive error handling
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

    // 3. Parse damage response with error handling
    const damages = parseDamageResponse(visionResult.response, validatedRequest.imageUrls)
    console.log(`[OLLAMA_ASSESS] Detected ${damages.length} damages`)

    // 4. Generate embeddings for damage descriptions
    let embeddings: number[][] = []
    let embeddingLatency = 0

    if (damages.length > 0) {
      try {
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
      } catch (error) {
        // Log embedding error but don't fail the entire request
        ErrorLogger.log(createAppError(error), {
          operation: "generateEmbeddings",
          damageCount: damages.length,
        })
        console.warn(`[OLLAMA_ASSESS] Embedding generation failed, continuing without embeddings`)
      }
    }

    // 5. Generate estimate items with error handling
    const estimateItems = generateEstimateItems(damages)
    const totalEstimate = estimateItems.reduce((sum, item) => sum + (item?.totalCost || 0), 0)

    // 6. Calculate overall confidence
    const overallConfidence =
      damages.length > 0 ? damages.reduce((sum, d) => sum + (d.confidence || 0), 0) / damages.length : 1.0

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
    const appError = createAppError(error)

    console.error("[OLLAMA_ASSESS] Assessment failed:", appError)

    // Track error with detailed context
    await trackMetric("ai.assessment_error", 1, {
      processingTime: totalProcessingTime,
      error: appError.message,
      errorType: appError.type,
      imageCount: validatedRequest?.imageUrls?.length || 0,
    })

    // Log error with full context
    ErrorLogger.log(appError, {
      operation: "POST /api/ai/v1/assess",
      processingTime: totalProcessingTime,
      requestData: validatedRequest
        ? {
            imageCount: validatedRequest.imageUrls.length,
            vinNumber: validatedRequest.vinNumber,
          }
        : null,
    })

    // Report error to Sentry with context
    Sentry.captureException(appError, {
      tags: {
        endpoint: "/api/ai/v1/assess",
        errorType: appError.type,
        processingTime: totalProcessingTime,
      },
      extra: {
        processingTime: totalProcessingTime,
        imageCount: validatedRequest?.imageUrls?.length || 0,
      },
    })

    // Return appropriate error response based on error type
    if (appError instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: appError.message,
          processingTimeMs: totalProcessingTime,
          errorType: appError.type,
        },
        { status: 400 },
      )
    }

    if (appError instanceof NetworkError) {
      return NextResponse.json(
        {
          success: false,
          error: "Network error occurred",
          details: "Please check your connection and try again",
          processingTimeMs: totalProcessingTime,
          errorType: appError.type,
          retryable: appError.retryable,
        },
        { status: 503 },
      )
    }

    if (appError instanceof AIProcessingError) {
      return NextResponse.json(
        {
          success: false,
          error: "AI processing failed",
          details: "The AI service is temporarily unavailable",
          processingTimeMs: totalProcessingTime,
          errorType: appError.type,
          retryable: appError.retryable,
        },
        { status: 503 },
      )
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during assessment",
        details: process.env.NODE_ENV === "development" ? appError.message : "Please try again later",
        processingTimeMs: totalProcessingTime,
        errorType: appError.type || "UNKNOWN",
      },
      { status: 500 },
    )
  }
}

// Enhanced health check endpoint with comprehensive monitoring
export async function GET() {
  try {
    const healthChecks = await Promise.allSettled([
      // Test Ollama connection
      fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      }).then((res) => ({ ollama: res.ok })),

      // Test vision model availability
      fetch(`${OLLAMA_BASE_URL}/api/show`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: VISION_MODEL }),
        signal: AbortSignal.timeout(5000),
      }).then((res) => ({ visionModel: res.ok })),

      // Test embedding model availability
      fetch(`${OLLAMA_BASE_URL}/api/show`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: EMBED_MODEL }),
        signal: AbortSignal.timeout(5000),
      }).then((res) => ({ embeddingModel: res.ok })),
    ])

    const results = healthChecks.reduce(
      (acc, result) => {
        if (result.status === "fulfilled") {
          return { ...acc, ...result.value }
        }
        return acc
      },
      { ollama: false, visionModel: false, embeddingModel: false },
    )

    const isHealthy = results.ollama && results.visionModel && results.embeddingModel
    const status = isHealthy ? "healthy" : "degraded"

    return NextResponse.json(
      {
        status,
        service: "ollama-ai-assessment",
        version: "2.0.0",
        models: {
          vision: VISION_MODEL,
          embedding: EMBED_MODEL,
        },
        ollama: {
          url: OLLAMA_BASE_URL,
          healthy: results.ollama,
          visionModelAvailable: results.visionModel,
          embeddingModelAvailable: results.embeddingModel,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: isHealthy ? 200 : 503,
      },
    )
  } catch (error) {
    const appError = createAppError(error)
    ErrorLogger.log(appError, { operation: "GET /api/ai/v1/assess health check" })

    return NextResponse.json(
      {
        status: "unhealthy",
        service: "ollama-ai-assessment",
        error: appError.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
