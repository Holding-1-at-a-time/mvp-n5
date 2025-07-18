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
    const { vinNumber, imageUrls, customerId, shopId } = await req.json()

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
      customerId: customerId || null, // Optional customer ID
      shopId: shopId || null, // Optional shop ID
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
    console.error("API V2 inspect failed:", error)
    status = "error"
    errorMessage = error.message || "Internal server error during inspection creation."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    trackApiCall("api_v2_inspect", Date.now() - startTime, status, errorMessage)
  }
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  let status = "success"
  let errorMessage = ""

  try {
    const { searchParams } = new URL(req.url)
    const inspectionId = searchParams.get("id")
    const vinNumber = searchParams.get("vin")
    const customerId = searchParams.get("customerId")
    const shopId = searchParams.get("shopId")

    if (!inspectionId && !vinNumber && !customerId && !shopId) {
      status = "bad_request"
      errorMessage = "Missing inspection ID, VIN, customer ID, or shop ID."
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    let inspection
    if (inspectionId) {
      inspection = await convex.query(api.inspections.get, {
        id: inspectionId as any,
      })
    } else if (vinNumber) {
      // Example: Fetch by VIN, might return multiple if not unique
      const inspections = await convex.query(api.inspections.listByVin, { vinNumber })
      inspection = inspections[0] // Just taking the first one for simplicity
    } else if (customerId) {
      const inspections = await convex.query(api.inspections.listByCustomer, { customerId })
      inspection = inspections[0]
    } else if (shopId) {
      const inspections = await convex.query(api.inspections.listByShop, { shopId })
      inspection = inspections[0]
    }

    if (!inspection) {
      status = "not_found"
      errorMessage = "Inspection not found."
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json(inspection)
  } catch (error: any) {
    console.error("API V2 inspect GET failed:", error)
    status = "error"
    errorMessage = error.message || "Internal server error during inspection retrieval."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    trackApiCall("api_v2_inspect_get", Date.now() - startTime, status, errorMessage)
  }
}
