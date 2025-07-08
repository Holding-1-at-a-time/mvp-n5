import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const uploadImage = mutation({
  args: {
    data: v.array(v.number()),
    contentType: v.string(),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const blob = new Blob([new Uint8Array(args.data)], { type: args.contentType })
    const storageId = await ctx.storage.store(blob)

    await ctx.db.insert("files", {
      storageId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.data.length,
      uploadedAt: Date.now(),
    })

    return storageId
  },
})
