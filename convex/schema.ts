// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  //──────────────────────────────────────────────────────────────────────────────
  // A. Tenancy & Users
  //──────────────────────────────────────────────────────────────────────────────
  shops: defineTable({
    name: v.string(),
    contactEmail: v.string(),
    createdAt: v.number(),
  }),

  users: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("technician"),
      v.literal("viewer")
    ),
    createdAt: v.number(),
  }),

  //──────────────────────────────────────────────────────────────────────────────
  // B. Shop Configuration & Pricing Defaults
  //──────────────────────────────────────────────────────────────────────────────
  shopSettings: defineTable({
    shopId: v.id("shops"),
    laborRate: v.number(),
    skillMarkup: v.number(),        // e.g. 0.2 = +20%
    locationSurcharge: v.number(),  // e.g. 0.1 = +10%
    membershipDiscounts: v.record(v.string(), v.number()),
    workloadThreshold: v.number(),  // 0.8 = 80% capacity surge
    filthinessFactors: v.record(v.string(), v.number()),
    damageMultiplier: v.number(),
    areaUnitPrice: v.number(),
  }),

  //──────────────────────────────────────────────────────────────────────────────
  // C. Vehicles & Inspections
  //──────────────────────────────────────────────────────────────────────────────
  vehicles: defineTable({
    shopId: v.id("shops"),
    vin: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    createdAt: v.number(),
  }),
export default defineSchema({
  inspections: defineTable({
    vinNumber: v.string(),
    imageIds: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"), v.literal("failed")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        make: v.optional(v.string()),
        model: v.optional(v.string()),
        year: v.optional(v.number()),
      }),
    ),
  }),

  damages: defineTable({
    inspectionId: v.id("inspections"),
    type: v.string(),
    severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("severe")),
    location: v.string(),
    description: v.string(),
    confidence: v.number(),
    imageId: v.string(),
    boundingBox: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
      }),
    ),
  }),

  estimateItems: defineTable({
    inspectionId: v.id("inspections"),
    damageId: v.id("damages"),
    description: v.string(),
    service: v.string(),
    laborHours: v.number(),
    laborRate: v.number(),
    servceBasePrice: v.number(),
    partsCost: v.number(),
    totalCost: v.number(),
    category: v.string(),
  }),

  files: defineTable({
    storageId: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
  }),
})

// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  //──────────────────────────────────────────────────────────────────────────────
  // A. Tenancy & Users
  //──────────────────────────────────────────────────────────────────────────────
  shops: defineTable({
    name: v.string(),
    contactEmail: v.string(),
    createdAt: v.number(),
  }),

  users: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("technician"),
      v.literal("viewer")
    ),
    createdAt: v.number(),
  }),

  //──────────────────────────────────────────────────────────────────────────────
  // B. Shop Configuration & Pricing Defaults
  //──────────────────────────────────────────────────────────────────────────────
  shopSettings: defineTable({
    shopId: v.id("shops"),
    laborRate: v.number(),
    skillMarkup: v.number(),        // e.g. 0.2 = +20%
    locationSurcharge: v.number(),  // e.g. 0.1 = +10%
    membershipDiscounts: v.record(v.string(), v.number()),
    workloadThreshold: v.number(),  // 0.8 = 80% capacity surge
    filthinessFactors: v.record(v.string(), v.number()),
    damageMultiplier: v.number(),
    areaUnitPrice: v.number(),
  }),

  //──────────────────────────────────────────────────────────────────────────────
  // C. Vehicles & Inspections
  //──────────────────────────────────────────────────────────────────────────────
  vehicles: defineTable({
    shopId: v.id("shops"),
    vin: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    createdAt: v.number(),
  }),


  //──────────────────────────────────────────────────────────────────────────────
  // H. Semantic Knowledge Base (RAG)
  //──────────────────────────────────────────────────────────────────────────────
  knowledgeBase: defineTable({
    shopId: v.id("shops"),
    namespace: v.string(),
    chunkId: v.string(),
    content: v.string(),
    metadata: v.optional(v.record(v.string(), v.string())),
    createdAt: v.number(),
    embeddingId: v.optional(v.id("embeddingVectors")),
  }).index("by_embedding", ["embeddingId"]),

  //──────────────────────────────────────────────────────────────────────────────
  // I. Embeddings & Vector Index (Advanced Pattern)
  //──────────────────────────────────────────────────────────────────────────────
  embeddingVectors: defineTable({
    shopId: v.id("shops"),
    referenceType: v.union(
      v.literal("inspection"),
      v.literal("damage"),
      v.literal("knowledgeBase")
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
  }),

  //──────────────────────────────────────────────────────────────────────────────
  // J. Audit Logging
  //──────────────────────────────────────────────────────────────────────────────
  auditLogs: defineTable({
    shopId: v.optional(v.id("shops")),
    tableName: v.string(),
    recordId: v.string(),
    operation: v.union(v.literal("INSERT"), v.literal("UPDATE"), v.literal("DELETE")),
    changedFields: v.optional(v.record(v.string(), v.string())),
    timestamp: v.number(),
    userId: v.optional(v.id("users")),
  })

  // convex/functions/fetchInspectionsByEmbedding.ts
import { query } from "convex/functions";
import { v } from "convex/values";

export default query({
  args: {
    embeddingIds: v.array(v.id("embeddingVectors")),
  },
  handler: async (ctx, { embeddingIds }) => {
    const inspections = [];
    for (const embId of embeddingIds) {
      // Join via index defined on inspections.embeddingId
      const doc = await ctx.db
        .query("inspections")
        .withIndex("by_embedding", (q) => q.eq("embeddingId", embId))
        .unique();
      if (doc) inspections.push(doc);
    }
    return inspections;
  }
});
