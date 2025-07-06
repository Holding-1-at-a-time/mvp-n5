import { v } from "convex/values"
import { action } from "./_generated/server"
import { api } from "./_generated/api"

// V2 Workflow for processing media (images and videos)
export const processMediaV2 = action({
  args: {
    inspectionId: v.id("inspections"),
    media: v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("video")),
        url: v.string(),
        timestamp: v.optional(v.number()),
        metadata: v.optional(
          v.object({
            width: v.optional(v.number()),
            height: v.optional(v.number()),
            duration: v.optional(v.number()),
            format: v.optional(v.string()),
          }),
        ),
      }),
    ),
    options: v.object({
      enableStreaming: v.optional(v.boolean()),
      partialResults: v.optional(v.boolean()),
      confidenceThreshold: v.optional(v.number()),
      priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"))),
      webhookUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "processing",
        progress: {
          mediaProcessed: 0,
          totalMedia: args.media.length,
          currentStep: "Starting media processing",
        },
      })

      const allDamages = []
      let processedCount = 0

      for (const mediaFile of args.media) {
        try {
          // Update progress
          await ctx.runMutation(api.inspections.updateInspectionStatus, {
            id: args.inspectionId,
            status: "processing",
            progress: {
              mediaProcessed: processedCount,
              totalMedia: args.media.length,
              currentStep: `Processing ${mediaFile.type}: ${mediaFile.url}`,
            },
          })

          let damages = []

          if (mediaFile.type === "image") {
            damages = await processImageForDamages(mediaFile, args.options)
          } else if (mediaFile.type === "video") {
            damages = await processVideoForDamages(mediaFile, args.options)
          }

          // Filter by confidence threshold
          const confidenceThreshold = args.options.confidenceThreshold || 0.7
          const filteredDamages = damages.filter((d) => d.confidence >= confidenceThreshold)

          if (filteredDamages.length > 0) {
            // Batch create damages
            await ctx.runMutation(api.inspections.batchCreateDamages, {
              inspectionId: args.inspectionId,
              damages: filteredDamages.map((damage) => ({
                ...damage,
                imageId: mediaFile.url, // Reference to source media
              })),
            })

            allDamages.push(...filteredDamages)

            // Send partial results if enabled
            if (args.options.partialResults) {
              await ctx.runMutation(api.inspections.updateInspectionStatus, {
                id: args.inspectionId,
                status: "processing", // Still processing, but with partial results
                progress: {
                  mediaProcessed: processedCount + 1,
                  totalMedia: args.media.length,
                  currentStep: `Found ${filteredDamages.length} damages in ${mediaFile.type}`,
                },
              })
            }
          }

          processedCount++
        } catch (error) {
          console.error(`Failed to process media file ${mediaFile.url}:`, error)
          // Continue processing other files
        }
      }

      // Generate estimate based on all damages
      if (allDamages.length > 0) {
        await ctx.runAction(api.workflows.generateEstimateV2, {
          inspectionId: args.inspectionId,
          damages: allDamages,
        })
      }

      // Mark as complete
      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "complete",
        progress: {
          mediaProcessed: args.media.length,
          totalMedia: args.media.length,
          currentStep: "Processing complete",
        },
      })

      return {
        success: true,
        damagesFound: allDamages.length,
        mediaProcessed: processedCount,
      }
    } catch (error) {
      console.error("Media processing failed:", error)

      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "failed",
      })

      throw error
    }
  },
})

// Enhanced VIN decoding with vehicle specs
export const decodeVinV2 = action({
  args: {
    inspectionId: v.id("inspections"),
    vin: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Call NHTSA vPIC API
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${args.vin}?format=json`,
      )

      if (!response.ok) {
        throw new Error(`VIN decode failed: ${response.statusText}`)
      }

      const data = await response.json()
      const vehicle = data.Results[0]

      if (vehicle.ErrorCode !== "0") {
        throw new Error(vehicle.ErrorText || "Invalid VIN")
      }

      // Extract enhanced vehicle specs for Slick Solutions
      const vehicleSpecs = {
        make: vehicle.Make || "Unknown",
        model: vehicle.Model || "Unknown",
        year: Number.parseInt(vehicle.ModelYear) || 0,
        trim: vehicle.Trim || "Unknown",
        bodyClass: vehicle.BodyClass || "Unknown",
        vehicleType: vehicle.VehicleType || "Unknown",
        doors: vehicle.Doors || "Unknown",
        cylinders: vehicle.EngineCylinders || "Unknown",
        displacement: vehicle.DisplacementL || "Unknown",
        fuelType: vehicle.FuelTypePrimary || "Unknown",
        driveType: vehicle.DriveType || "Unknown",
        plantCity: vehicle.PlantCity || "Unknown",
        plantCountry: vehicle.PlantCountry || "Unknown",
        manufacturer: vehicle.Manufacturer || "Unknown",
        gvwr: vehicle.GrossVehicleWeightRating || "Unknown",
      }

      // Update inspection with enhanced vehicle data
      await ctx.runMutation(api.inspections.updateInspectionMetadata, {
        id: args.inspectionId,
        metadata: vehicleSpecs,
      })

      return vehicleSpecs
    } catch (error) {
      console.error("VIN decode failed:", error)
      // Don't fail the entire inspection for VIN decode errors
      return {
        make: "Unknown",
        model: "Unknown",
        year: 0,
        error: error instanceof Error ? error.message : "VIN decode failed",
      }
    }
  },
})

// Enhanced estimate generation with vehicle-specific pricing
export const generateEstimateV2 = action({
  args: {
    inspectionId: v.id("inspections"),
    damages: v.array(v.any()), // Damage objects
  },
  handler: async (ctx, args) => {
    try {
      // Get inspection with vehicle data
      const inspection = await ctx.runQuery(api.inspections.getInspection, {
        id: args.inspectionId,
      })

      if (!inspection) {
        throw new Error("Inspection not found")
      }

      const estimateItems = []

      for (const damage of args.damages) {
        // Calculate base cost based on damage type and severity
        let baseCost = getBaseDamageCost(damage.type, damage.severity)
        let laborHours = getBaseLaborHours(damage.type, damage.severity)

        // Apply vehicle-specific modifiers
        if (inspection.metadata) {
          const modifiers = getVehiclePricingModifiers(inspection.metadata)
          baseCost *= modifiers.sizeFactor * modifiers.complexityFactor * modifiers.specialtyFactor
          laborHours *= modifiers.ageFactor
        }

        const laborRate = 85 // $85/hour base rate
        const partsCost = baseCost * 0.6 // Parts are ~60% of total
        const laborCost = laborHours * laborRate
        const totalCost = partsCost + laborCost

        const estimateItem = {
          inspectionId: args.inspectionId,
          damageId: damage.id || `damage_${Date.now()}_${Math.random()}`,
          description: `${damage.type} repair - ${damage.location}`,
          laborHours,
          laborRate,
          partsCost,
          totalCost,
          category: getDamageCategory(damage.type),
        }

        // Store estimate item
        await ctx.runMutation(api.estimateItems.create, estimateItem)
        estimateItems.push(estimateItem)
      }

      return {
        success: true,
        itemCount: estimateItems.length,
        totalCost: estimateItems.reduce((sum, item) => sum + item.totalCost, 0),
      }
    } catch (error) {
      console.error("Estimate generation failed:", error)
      throw error
    }
  },
})

// Webhook notification sender
export const sendWebhookNotification = action({
  args: {
    inspectionId: v.id("inspections"),
    webhookUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const inspection = await ctx.runQuery(api.inspections.getInspectionV2, {
        id: args.inspectionId,
      })

      if (!inspection) {
        throw new Error("Inspection not found")
      }

      const payload = {
        event: "inspection.completed",
        inspectionId: args.inspectionId,
        timestamp: new Date().toISOString(),
        data: {
          vin: inspection.vinNumber,
          status: inspection.status,
          damageCount: inspection.damages?.length || 0,
          totalCost: inspection.estimate?.totalCost || 0,
          processingTime: inspection.processingTime,
        },
      }

      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "SlickSolutions-Webhooks/1.0",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Webhook notification failed:", error)
      // Don't throw - webhook failures shouldn't break the workflow
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

// Helper functions for damage assessment (AI stubs)
async function processImageForDamages(mediaFile: any, options: any) {
  // Simulate AI image processing
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Mock damage detection results
  const mockDamages = [
    {
      type: "Scratch",
      severity: "minor" as const,
      location: "Front bumper",
      description: "Surface scratch on front bumper",
      confidence: 0.85,
      boundingBox: { x: 100, y: 150, width: 80, height: 40 },
    },
    {
      type: "Dent",
      severity: "moderate" as const,
      location: "Driver door",
      description: "Small dent on driver side door",
      confidence: 0.92,
      boundingBox: { x: 200, y: 300, width: 60, height: 60 },
    },
  ]

  // Randomly return 0-2 damages to simulate real detection
  return mockDamages.slice(0, Math.floor(Math.random() * 3))
}

async function processVideoForDamages(mediaFile: any, options: any) {
  // Simulate AI video processing (longer than images)
  await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 5000))

  // Mock video-based damage detection
  const mockDamages = [
    {
      type: "Paint damage",
      severity: "moderate" as const,
      location: "Rear quarter panel",
      description: "Paint chip and oxidation",
      confidence: 0.78,
      boundingBox: { x: 150, y: 200, width: 100, height: 80 },
    },
  ]

  return mockDamages.slice(0, Math.floor(Math.random() * 2))
}

function getBaseDamageCost(type: string, severity: string): number {
  const baseCosts = {
    Scratch: { minor: 150, moderate: 300, severe: 600 },
    Dent: { minor: 200, moderate: 500, severe: 1200 },
    "Paint damage": { minor: 250, moderate: 450, severe: 800 },
    Crack: { minor: 100, moderate: 350, severe: 700 },
  }

  return baseCosts[type as keyof typeof baseCosts]?.[severity as keyof typeof baseCosts.Scratch] || 300
}

function getBaseLaborHours(type: string, severity: string): number {
  const laborHours = {
    Scratch: { minor: 1, moderate: 2, severe: 4 },
    Dent: { minor: 1.5, moderate: 3, severe: 6 },
    "Paint damage": { minor: 2, moderate: 3, severe: 5 },
    Crack: { minor: 1, moderate: 2.5, severe: 4 },
  }

  return laborHours[type as keyof typeof laborHours]?.[severity as keyof typeof laborHours.Scratch] || 2
}

function getDamageCategory(type: string): string {
  const categories = {
    Scratch: "Cosmetic",
    Dent: "Body Work",
    "Paint damage": "Paint & Finish",
    Crack: "Structural",
  }

  return categories[type as keyof typeof categories] || "General"
}

function getVehiclePricingModifiers(metadata: any) {
  const modifiers = {
    ageFactor: 1.0,
    sizeFactor: 1.0,
    complexityFactor: 1.0,
    specialtyFactor: 1.0,
  }

  // Age-based pricing adjustments
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - (metadata.year || currentYear)
  if (vehicleAge > 15) modifiers.ageFactor = 1.2
  if (vehicleAge < 3) modifiers.ageFactor = 1.1

  // Size-based adjustments
  if (metadata.bodyClass?.toLowerCase().includes("truck") || metadata.bodyClass?.toLowerCase().includes("suv")) {
    modifiers.sizeFactor = 1.3
  }

  // Complexity based on drive type
  if (metadata.driveType?.toLowerCase().includes("4wd") || metadata.driveType?.toLowerCase().includes("awd")) {
    modifiers.complexityFactor = 1.15
  }

  // Specialty handling for luxury/electric
  if (metadata.fuelType?.toLowerCase().includes("electric") || metadata.fuelType?.toLowerCase().includes("hybrid")) {
    modifiers.specialtyFactor = 1.25
  }

  return modifiers
}

// Add this new function to the existing workflows-v2.ts file

export const processMediaWithOllama = action({
  args: {
    inspectionId: v.id("inspections"),
    media: v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("video")),
        url: v.string(),
        timestamp: v.optional(v.number()),
        metadata: v.optional(
          v.object({
            width: v.optional(v.number()),
            height: v.optional(v.number()),
            duration: v.optional(v.number()),
            format: v.optional(v.string()),
          }),
        ),
      }),
    ),
    vinNumber: v.string(),
    options: v.object({
      enableStreaming: v.optional(v.boolean()),
      partialResults: v.optional(v.boolean()),
      confidenceThreshold: v.optional(v.number()),
      priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"))),
      webhookUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "processing",
        progress: {
          mediaProcessed: 0,
          totalMedia: args.media.length,
          currentStep: "Starting Ollama AI processing",
        },
      })

      // Filter only image media for Ollama processing
      const imageMedia = args.media.filter((m) => m.type === "image")

      if (imageMedia.length === 0) {
        throw new Error("No images provided for Ollama processing")
      }

      // Call the Ollama assessment API
      const assessmentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/v1/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls: imageMedia.map((m) => m.url),
          vinNumber: args.vinNumber,
          metadata: {
            inspectionId: args.inspectionId,
            timestamp: Date.now(),
          },
        }),
      })

      if (!assessmentResponse.ok) {
        throw new Error(`Ollama assessment failed: ${assessmentResponse.statusText}`)
      }

      const assessmentData = await assessmentResponse.json()

      if (!assessmentData.success) {
        throw new Error(`Ollama assessment error: ${assessmentData.error}`)
      }

      // Update progress
      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "processing",
        progress: {
          mediaProcessed: imageMedia.length,
          totalMedia: args.media.length,
          currentStep: `Ollama found ${assessmentData.damages.length} damages`,
        },
      })

      // Store damages in database
      if (assessmentData.damages.length > 0) {
        await ctx.runMutation(api.inspections.batchCreateDamages, {
          inspectionId: args.inspectionId,
          damages: assessmentData.damages.map((damage: any) => ({
            type: damage.type,
            severity: damage.severity,
            location: damage.location,
            description: damage.description,
            confidence: damage.confidence,
            imageId: damage.imageUrl,
            boundingBox: damage.boundingBox,
            embedding: damage.embedding,
            metadata: {
              ollamaAssessmentId: assessmentData.assessmentId,
              modelVersion: assessmentData.metadata.modelVersion,
              processingTime: assessmentData.metadata.ollamaLatency,
            },
          })),
        })
      }

      // Generate estimate based on Ollama results
      if (assessmentData.damages.length > 0) {
        await ctx.runAction(api.workflows.generateEstimateV2, {
          inspectionId: args.inspectionId,
          damages: assessmentData.damages,
        })
      }

      // Mark as complete
      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "complete",
        progress: {
          mediaProcessed: args.media.length,
          totalMedia: args.media.length,
          currentStep: "Ollama processing complete",
        },
      })

      // Send webhook notification if configured
      if (args.options.webhookUrl) {
        await ctx.runAction(api.workflows.sendWebhookNotification, {
          inspectionId: args.inspectionId,
          webhookUrl: args.options.webhookUrl,
        })
      }

      return {
        success: true,
        damagesFound: assessmentData.damages.length,
        totalEstimate: assessmentData.totalEstimate,
        confidence: assessmentData.confidence,
        processingTime: assessmentData.processingTimeMs,
        ollamaMetadata: assessmentData.metadata,
      }
    } catch (error) {
      console.error("Ollama media processing failed:", error)

      await ctx.runMutation(api.inspections.updateInspectionStatus, {
        id: args.inspectionId,
        status: "failed",
        progress: {
          mediaProcessed: 0,
          totalMedia: args.media.length,
          currentStep: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      })

      throw error
    }
  },
})
