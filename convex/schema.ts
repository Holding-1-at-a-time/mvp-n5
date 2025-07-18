import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  //──────────────────────────────────────────────────────────────────────────────
  // A. Tenancy & Users
  //──────────────────────────────────────────────────────────────────────────────
  shops: defineTable({
    name: v.string(),
    contactEmail: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    settings: v.optional(
      v.object({
        laborRate: v.number(),
        skillMarkup: v.number(),
        locationSurcharge: v.number(),
        workloadThreshold: v.number(),
        damageMultiplier: v.number(),
        areaUnitPrice: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["contactEmail"]),

  users: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("technician"), v.literal("viewer")),
    isActive: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_email", ["email"])
    .index("by_shop_role", ["shopId", "role"]),

  //──────────────────────────────────────────────────────────────────────────────
  // B. Shop Configuration & Pricing Defaults
  //──────────────────────────────────────────────────────────────────────────────
  shopSettings: defineTable({
    shopId: v.id("shops"),
    laborRate: v.number(),
    skillMarkup: v.number(), // e.g. 0.2 = +20%
    locationSurcharge: v.number(), // e.g. 0.1 = +10%
    membershipDiscounts: v.record(v.string(), v.number()),
    workloadThreshold: v.number(), // 0.8 = 80% capacity surge
    filthinessFactors: v.record(v.string(), v.number()),
    damageMultiplier: v.number(),
    areaUnitPrice: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_shop", ["shopId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // C. Vehicles & Inspections
  //──────────────────────────────────────────────────────────────────────────────
  vehicles: defineTable({
    shopId: v.id("shops"),
    vin: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.optional(v.string()),
    mileage: v.optional(v.number()),
    customerId: v.optional(v.id("customers")),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_vin", ["vin"])
    .index("by_customer", ["customerId"]),

  customers: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_email", ["email"]),

  inspections: defineTable({
    shopId: v.id("shops"),
    vehicleId: v.id("vehicles"),
    customerId: v.optional(v.id("customers")),
    vinNumber: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    imageIds: v.array(v.string()),
    totalDamages: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    notes: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        make: v.optional(v.string()),
        model: v.optional(v.string()),
        year: v.optional(v.number()),
        aiModel: v.optional(v.string()),
        processingTime: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_status", ["status"])
    .index("by_shop_status", ["shopId", "status"]),

  damages: defineTable({
    shopId: v.id("shops"),
    inspectionId: v.id("inspections"),
    type: v.string(),
    severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("severe")),
    location: v.string(),
    description: v.string(),
    confidence: v.number(),
    imageId: v.string(),
    estimatedCost: v.optional(v.number()),
    boundingBox: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
      }),
    ),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
  })
    .index("by_shop", ["shopId"])
    .index("by_inspection", ["inspectionId"])
    .index("by_severity", ["severity"]),

  estimateItems: defineTable({
    shopId: v.id("shops"),
    inspectionId: v.id("inspections"),
    damageId: v.id("damages"),
    description: v.string(),
    service: v.string(),
    laborHours: v.number(),
    laborRate: v.number(),
    serviceBasePrice: v.number(),
    partsCost: v.number(),
    totalCost: v.number(),
    category: v.string(),
    createdAt: v.number(),
  })
    .index("by_shop", ["shopId"])
    .index("by_inspection", ["inspectionId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // D. File Storage
  //──────────────────────────────────────────────────────────────────────────────
  files: defineTable({
    shopId: v.optional(v.id("shops")),
    storageId: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    url: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
    uploadedAt: v.number(),
  })
    .index("by_shop", ["shopId"])
    .index("by_storage_id", ["storageId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // E. Scheduling & Appointments
  //──────────────────────────────────────────────────────────────────────────────
  appointments: defineTable({
    shopId: v.id("shops"),
    customerId: v.id("customers"),
    vehicleId: v.optional(v.id("vehicles")),
    inspectionId: v.optional(v.id("inspections")),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(), // in minutes
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_customer", ["customerId"])
    .index("by_scheduled_at", ["scheduledAt"])
    .index("by_status", ["status"]),

  //──────────────────────────────────────────────────────────────────────────────
  // F. Pricing & Estimates
  //──────────────────────────────────────────────────────────────────────────────
  pricingRules: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    damageType: v.string(),
    severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("severe")),
    basePrice: v.number(),
    laborHours: v.number(),
    partsCost: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_damage_type", ["damageType"]),

  //──────────────────────────────────────────────────────────────────────────────
  // G. AI & Processing
  //──────────────────────────────────────────────────────────────────────────────
  aiProcessingJobs: defineTable({
    shopId: v.id("shops"),
    inspectionId: v.id("inspections"),
    jobType: v.union(v.literal("damage_detection"), v.literal("cost_estimation"), v.literal("report_generation")),
    status: v.union(v.literal("queued"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    model: v.optional(v.string()),
    prompt: v.optional(v.string()),
    result: v.optional(v.record(v.string(), v.any())),
    error: v.optional(v.string()),
    processingTime: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_shop", ["shopId"])
    .index("by_inspection", ["inspectionId"])
    .index("by_status", ["status"]),

  //──────────────────────────────────────────────────────────────────────────────
  // H. Semantic Knowledge Base (RAG)
  //──────────────────────────────────────────────────────────────────────────────
  knowledgeBase: defineTable({
    shopId: v.id("shops"),
    namespace: v.string(),
    chunkId: v.string(),
    content: v.string(),
    title: v.optional(v.string()),
    source: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
    embeddingId: v.optional(v.id("embeddingVectors")),
  })
    .index("by_shop", ["shopId"])
    .index("by_namespace", ["namespace"])
    .index("by_embedding", ["embeddingId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // I. Embeddings & Vector Index
  //──────────────────────────────────────────────────────────────────────────────
  embeddingVectors: defineTable({
    shopId: v.id("shops"),
    referenceType: v.union(
      v.literal("inspection"),
      v.literal("damage"),
      v.literal("knowledgeBase"),
      v.literal("vehicle"),
    ),
    referenceId: v.string(),
    vector: v.array(v.float64()),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
  })
    .vectorIndex("by_vector", {
      vectorField: "vector",
      dimensions: 1024,
      filterFields: ["shopId", "referenceType"],
    })
    .index("by_shop", ["shopId"])
    .index("by_reference", ["referenceType", "referenceId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // J. Audit Logging
  //──────────────────────────────────────────────────────────────────────────────
  auditLogs: defineTable({
    shopId: v.optional(v.id("shops")),
    tableName: v.string(),
    recordId: v.string(),
    operation: v.union(v.literal("INSERT"), v.literal("UPDATE"), v.literal("DELETE")),
    changedFields: v.optional(v.record(v.string(), v.string())),
    oldValues: v.optional(v.record(v.string(), v.string())),
    newValues: v.optional(v.record(v.string(), v.string())),
    timestamp: v.number(),
    userId: v.optional(v.id("users")),
    userEmail: v.optional(v.string()),
  })
    .index("by_shop", ["shopId"])
    .index("by_table", ["tableName"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // K. System Configuration
  //──────────────────────────────────────────────────────────────────────────────
  systemSettings: defineTable({
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublic: v.boolean(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }).index("by_key", ["key"]),
})
