import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { env } from "@/lib/env"
import { trackApiCall } from "@/lib/observability"

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let status = "success"
  let errorMessage = ""

  try {
    const { vinNumber, imageUrls } = await req.json()

    if (!vinNumber || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      status = "bad_request"
      errorMessage = "Missing vinNumber or imageUrls in request body."
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // In a real application, you would likely upload images to Convex storage here
    // and get their storage IDs before creating the inspection record.
    // For this example, we'll assume imageUrls are already accessible by Convex.

    const inspectionId = await convex.mutation(api.inspections.create, {
      vinNumber,
      imageUrls, // Storing URLs directly for simplicity in this API route
      status: "pending",
      createdAt: Date.now(),
    })

    // Enqueue processing workflow
    await convex.mutation(api.workflows.enqueueProcessInspection, {
      inspectionId,
    })

    return NextResponse.json({
      success: true,
      inspectionId,
      status: "pending",
      message: "Inspection created and processing initiated.",
    })
  } catch (error: any) {
    console.error("API V1 inspect failed:", error)
    status = "error"
    errorMessage = error.message || "Internal server error during inspection creation."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    trackApiCall("api_v1_inspect", Date.now() - startTime, status, errorMessage)
  }
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  let status = "success"
  let errorMessage = ""

  try {
    const { searchParams } = new URL(req.url)
    const inspectionId = searchParams.get("id")

    if (!inspectionId) {
      status = "bad_request"
      errorMessage = "Missing inspection ID."
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const inspection = await convex.query(api.inspections.get, {
      id: inspectionId as any, // Cast to any because Id&lt;"inspections"> is not directly available here
    })

    if (!inspection) {
      status = "not_found"
      errorMessage = "Inspection not found."
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json(inspection)
  } catch (error: any) {
    console.error("API V1 inspect GET failed:", error)
    status = "error"
    errorMessage = error.message || "Internal server error during inspection retrieval."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    trackApiCall("api_v1_inspect_get", Date.now() - startTime, status, errorMessage)
  }
}
