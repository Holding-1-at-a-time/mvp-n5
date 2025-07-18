"use server"

import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { env } from "@/lib/env"

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL!)

export async function createInspection(formData: FormData) {
  try {
    const vinNumber = formData.get("vinNumber") as string

    if (!vinNumber) {
      return { success: false, error: "VIN number is required" }
    }

    // Extract images from form data
    const images: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        images.push(value)
      }
    }

    if (images.length < 3) {
      return { success: false, error: "At least 3 images are required" }
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

    return {
      success: true,
      inspectionId,
      status: "pending",
    }
  } catch (error) {
    console.error("Failed to create inspection:", error)
    return {
      success: false,
      error: "Failed to create inspection. Please try again.",
    }
  }
}
