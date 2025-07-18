/**
 * Minimal Convex module so `api.components.*` imports resolve.
 * Replace with real queries/mutations later.
 */

import { query } from "convex/server"

export const hello = query(async () => {
  return "hello from Convex components module"
})
