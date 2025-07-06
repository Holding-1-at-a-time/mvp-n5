import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { trackMetric, trackError } from "@/lib/observability"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// V2 API Schema - supports video, partial results, and streaming
const InspectV2Schema = z.object({
  vin: z.string().length(17, "VIN must be exactly 17 characters"),
  media: z
    .array(
      z.object({
        type: z.enum(["image", "video"]),
        url: z.string().url(),
        timestamp: z.number().optional(),
        metadata: z
          .object({
            width: z.number().optional(),
            height: z.number().optional(),
            duration: z.number().optional(), // for videos
            format: z.string().optional(),
          })
          .optional(),
      }),
    )
    .min(1, "At least one media file required"),
  options: z
    .object({
      enableStreaming: z.boolean().default(false),
      partialResults: z.boolean().default(false),
      confidenceThreshold: z.number().min(0).max(1).default(0.7),
      priority: z.enum(["low", "normal", "high"]).default("normal"),
      webhookUrl: z.string().url().optional(),
    })
    .optional(),
  metadata: z
    .object({
      location: z
        .object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          address: z.string().optional(),
        })
        .optional(),
      inspector: z
        .object({
          id: z.string().optional(),
          name: z.string().optional(),
        })
        .optional(),
      customerInfo: z
        .object({
          id: z.string().optional(),
          name: z.string().optional(),
          contact: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request
    const body = await request.json()
    const validatedData = InspectV2Schema.parse(body)

    // Track API usage
    await trackMetric("api.v2.inspect.request", 1, {
      mediaCount: validatedData.media.length,
      hasVideo: validatedData.media.some((m) => m.type === "video"),
      streamingEnabled: validatedData.options?.enableStreaming || false,
      priority: validatedData.options?.priority || "normal",
    })

    // Create inspection with V2 features
    const inspectionId = await convex.mutation(api.inspections.createV2Inspection, {
      vin: validatedData.vin,
      media: validatedData.media,
      options: validatedData.options || {},
      metadata: validatedData.metadata || {},
    })

    // For streaming requests, return immediately with processing status
    if (validatedData.options?.enableStreaming) {
      return NextResponse.json(
        {
          success: true,
          inspectionId,
          status: "processing",
          streamUrl: `/api/v2/inspect/${inspectionId}/stream`,
          estimatedCompletion: new Date(Date.now() + 120000).toISOString(), // 2 minutes
          message: "Inspection started. Use streamUrl for real-time updates.",
        },
        { status: 202 },
      )
    }

    // For non-streaming, process synchronously (with timeout)
    const result = await Promise.race([
      convex.query(api.workflows.processInspectionV2, { inspectionId }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Processing timeout")), 30000)),
    ])

    const processingTime = Date.now() - startTime
    await trackMetric("api.v2.inspect.processing_time", processingTime)

    return NextResponse.json({
      success: true,
      inspectionId,
      status: "completed",
      processingTime,
      result,
      apiVersion: "2.0",
    })
  } catch (error) {
    const processingTime = Date.now() - startTime

    if (error instanceof z.ZodError) {
      await trackError("api.v2.inspect.validation_error", error, {
        processingTime,
        errors: error.errors,
      })

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
          apiVersion: "2.0",
        },
        { status: 400 },
      )
    }

    await trackError("api.v2.inspect.processing_error", error, {
      processingTime,
    })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
        apiVersion: "2.0",
      },
      { status: 500 },
    )
  }
}

// GET endpoint for inspection status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const inspectionId = searchParams.get("id")

  if (!inspectionId) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing inspection ID",
        apiVersion: "2.0",
      },
      { status: 400 },
    )
  }

  try {
    const inspection = await convex.query(api.inspections.getInspection, {
      id: inspectionId as any,
    })

    return NextResponse.json({
      success: true,
      inspection,
      apiVersion: "2.0",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Inspection not found",
        apiVersion: "2.0",
      },
      { status: 404 },
    )
  }
}
