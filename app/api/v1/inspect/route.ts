import { type NextRequest, NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const vinNumber = formData.get("vinNumber") as string

    if (!vinNumber) {
      return NextResponse.json({ error: "VIN number is required" }, { status: 400 })
    }

    // Extract images from form data
    const images: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        images.push(value)
      }
    }

    if (images.length < 3) {
      return NextResponse.json({ error: "At least 3 images are required" }, { status: 400 })
    }

    // Upload images to Convex File Storage
    const imageIds: string[] = []
    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer()
      const storageId = await convex.mutation(api.files.uploadImage, {
        data: Array.from(new Uint8Array(arrayBuffer)),
        contentType: image.type,
        filename: image.name,
      })
      imageIds.push(storageId)
    }

    // Create inspection record
    const inspectionId = await convex.mutation(api.inspections.create, {
      vinNumber,
      imageIds,
      status: "pending",
      createdAt: Date.now(),
    })

    // Enqueue processing workflow
    await convex.mutation(api.workflows.enqueueProcessInspection, {
      inspectionId,
    })

    return NextResponse.json({
      inspectionId,
      status: "pending",
    })
  } catch (error) {
    console.error("Failed to create inspection:", error)
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 })
  }
}
