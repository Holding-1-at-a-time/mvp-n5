// convex/functions/addKnowledgeBase.ts
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
    docs: v.array(v.object({
      chunkId: v.string(),
      content: v.string(),
      metadata: v.record(v.string(), v.string()),
    })),
  },
  handler: async (ctx, { shopId, docs }) => {
    const ns = `${shopId}-kb`;

    // Upsert KB and collect text for embedding
    const texts: string[] = [];
    for (const doc of docs) {
      await ctx.db.insertOrReplace("knowledgeBase", {
        shopId,
        namespace: ns,
        chunkId: doc.chunkId,
        content: doc.content,
        metadata: doc.metadata,
        createdAt: Date.now(),
      });
      texts.push(doc.content);
    }

    // Generate embeddings & insert into embeddingVectors
    try {
      const embeddings = await ragClient.embedTexts(ctx, texts);
      for (let i = 0; i < embeddings.length; i++) {
        const emb = embeddings[i];
        const { chunkId } = docs[i];
        await ctx.db.insert("embeddingVectors", {
          shopId,
          referenceType: "knowledgeBase",
          referenceId: chunkId,
          vector: emb,
          metadata: {},
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      ctx.log.error("KB embedding error", { shopId, error: (err as Error).message });
      throw err;
    }
  }
});
