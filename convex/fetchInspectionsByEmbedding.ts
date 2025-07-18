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
