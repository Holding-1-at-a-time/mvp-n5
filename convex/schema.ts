import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  inspections: defineTable({
    shopId: v.string(),
    customerId: v.string(),
    status: v.string(), // e.g., "pending", "in_progress", "completed", "cancelled"
    vehicleInfo: v.object({
      vin: v.string(),
      make: v.string(),
      model: v.string(),
      year: v.string(),
      bodyClass: v.string(),
      fuelType: v.string(),
      plantCountry: v.string(),
    }),
    vehicleSpecs: v.optional(
      v.object({
        year: v.number(),
        make: v.string(),
        model: v.string(),
        trim: v.string(),
        bodyClass: v.string(),
        vehicleType: v.string(),
        doors: v.number(),
        cylinders: v.number(),
        displacement: v.number(),
        fuelType: v.string(),
        driveType: v.string(),
        plantCity: v.string(),
        plantCountry: v.string(),
        gvwr: v.number(),
        ageFactor: v.number(),
        sizeFactor: v.number(),
        complexityFactor: v.number(),
        specialtyFactor: v.number(),
      }),
    ),
    photos: v.array(
      v.object({
        fileId: v.id("_storage"),
        url: v.string(),
        timestamp: v.number(),
        tags: v.array(v.string()), // e.g., "front", "rear", "interior"
      }),
    ),
    damageAssessment: v.optional(
      v.object({
        filthiness: v.string(), // e.g., "light", "moderate", "heavy", "extreme"
        damages: v.array(
          v.object({
            type: v.string(), // e.g., "dent", "scratch", "crack"
            severity: v.number(), // 0-1 scale
            location: v.string(), // e.g., "front_bumper", "driver_door"
            area: v.number(), // in square meters
            confidence: v.number(), // AI confidence score
          }),
        ),
        summary: v.string(),
        recommendations: v.array(v.string()),
        assessedAt: v.number(),
      }),
    ),
    pricingParams: v.optional(
      v.object({
        basePrice: v.number(),
        defaultDuration: v.number(),
        durationHrs: v.optional(v.number()),
        techCount: v.number(),
        filthinessFactor: v.number(),
        ageFactor: v.number(),
        bodyFactor: v.number(),
        damageFactor: v.number(),
        areaFactor: v.number(),
        laborRate: v.number(),
        skillMarkup: v.number(),
        workloadFactor: v.number(),
        locationSurcharge: v.number(),
        membershipDiscount: v.number(),
        loyaltyCredit: v.number(),
        weatherFactor: v.number(),
        seasonalFactor: v.number(),
        competitorFactor: v.number(),
      }),
    ),
    estimateAmount: v.optional(v.number()),
    priceBreakdown: v.optional(
      v.object({
        basePrice: v.number(),
        laborCost: v.number(),
        damageSurcharge: v.number(),
        areaSurcharge: v.number(),
        filthinessFactor: v.number(),
        workloadFactor: v.number(),
        locationSurcharge: v.number(),
        weatherSurcharge: v.number(),
        seasonalAdjustment: v.number(),
        competitorAdjustment: v.number(),
        membershipDiscount: v.number(),
        loyaltyCredit: v.number(),
        subtotal: v.number(),
        total: v.number(),
        savings: v.number(),
      }),
    ),
    serviceRecommendations: v.optional(v.array(v.string())),
    scheduledAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_shop", ["shopId"]),

  shopSettings: defineTable({
    shopId: v.string(),
    laborRate: v.number(),
    skillMarkup: v.number(),
    locationSurcharge: v.number(),
    membershipDiscounts: v.object({
      Bronze: v.number(),
      Silver: v.number(),
      Gold: v.number(),
      Platinum: v.number(),
    }),
    workloadThreshold: v.number(),
    filthinessFactors: v.object({
      light: v.number(),
      moderate: v.number(),
      heavy: v.number(),
      extreme: v.number(),
    }),
    damageSeverityMultiplier: v.number(),
    areaUnitPrice: v.number(),
    servicePackages: v.record(
      v.string(),
      v.object({
        sku: v.string(),
        name: v.string(),
        description: v.string(),
        basePrice: v.number(),
        defaultDurationHrs: v.number(),
        filthinessFactors: v.object({
          light: v.number(),
          moderate: v.number(),
          heavy: v.number(),
          extreme: v.number(),
        }),
        vehicleTypeMultipliers: v.record(v.string(), v.number()),
      }),
    ),
    // New tax rate fields
    serviceTaxRate: v.number(),
    materialTaxRate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_shop", ["shopId"]),

  customerProfiles: defineTable({
    shopId: v.string(),
    customerId: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    name: v.optional(v.string()),
    membershipTier: v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum")),
    loyaltyPoints: v.number(),
    historicalSpend: v.number(),
    preferredServices: v.array(v.string()),
    vehicleHistory: v.array(
      v.object({
        vin: v.string(),
        lastServiceDate: v.number(),
        serviceCount: v.number(),
        totalSpend: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_customer", ["customerId"]),

  marketConditions: defineTable({
    shopId: v.string(),
    date: v.string(), // YYYY-MM-DD
    weatherFactor: v.number(),
    seasonalDemand: v.number(),
    competitorIndex: v.number(),
    localDemand: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_shop", ["shopId"]),

  knowledgeBase: defineTable({
    shopId: v.string(),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    embedding: v.array(v.number()), // For RAG
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_shop", ["shopId"]),

  apiLogs: defineTable({
    shopId: v.string(),
    endpoint: v.string(),
    method: v.string(),
    status: v.number(),
    latency: v.number(), // in ms
    requestBody: v.optional(v.string()),
    responseBody: v.optional(v.string()),
    error: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_shop", ["shopId"]),

  ollamaMetrics: defineTable({
    shopId: v.string(),
    model: v.string(),
    type: v.string(), // e.g., "vision", "embedding"
    latency: v.number(), // in ms
    tokensProcessed: v.number(),
    success: v.boolean(),
    error: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_shop", ["shopId"]),
})
