import { query } from "convex/server"
import { v } from "convex/values"

/**
 * Minimal placeholder Convex module.
 * Replace or extend with useful queries/mutations as your app evolves.
 */
export const hello = query({
  args: { name: v.optional(v.string()) },
  handler: async (_ctx, { name }) => {
    return `Hello from the components module${name ? `, ${name}` : ""}!`
  },
})
