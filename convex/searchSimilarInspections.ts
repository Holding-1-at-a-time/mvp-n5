// convex/functions/searchSimilarInspections.ts
import { action } from "convex/functions";
import { RAG }     from "@convex-dev/rag";
import { components } from "../_generated/api";
import { v } from "convex/values";

const ragClient = new RAG(components.rag, {
  textEmbeddingModel: "mxbai-embed-large",
  dimension: 1024,
});

export default action({
  args: {
    shopId: v.id("shops"),
    queryText: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { shopId, queryText, limit = 5 }) => {
    const ns = `${shopId}-kb`;

    try {
      // 1. Embed the query
      const [queryEmb] = await ragClient.embedTexts(ctx, [queryText]);

      // 2. Vector search in embeddingVectors
      const results = await ctx.vectorSearch(
        "embeddingVectors",
        "by_vector",
        {
          vector: queryEmb,
          limit,
          filter: (q) =>
            q.eq("shopId", shopId).eq("referenceType", "inspection"),
        }
      );

      // 3. Extract referenceIds & scores
      return results.map(r => ({
        inspectionId: r._id,  // actually embeddingVectors._id
        score: r._score,
      }));
    } catch (err) {
      ctx.log.error("SearchSimilarInspections failed", {
        shopId,
        error: (err as Error).message
      });
      return [];
    }
  }
});
