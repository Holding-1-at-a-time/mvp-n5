import { query } from "convex/server"
import { v } from "convex/values"

/**
 * Placeholder Convex module.
 * This prevents build-time “api.components” errors.
 * Replace or extend with real server functions as needed.
 */
export const hello = query({
  args: { text: v.optional(v.string()) },
  handler: async (_ctx, { text }) => {
    return `Hello from components module${text ? `, ${text}` : ""}!`
  },
})
