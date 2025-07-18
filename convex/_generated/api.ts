/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules } from "convex/server"
import type * as addKnowledgeBase from "../addKnowledgeBase.js"
import type * as ai from "../ai.js"
import type * as attachments from "../attachments.js"
import type * as customers from "../customers.js"
import type * as fetchInspectionsByEmbedding from "../fetchInspectionsByEmbedding.js"
import type * as files from "../files.js"
import type * as inspections from "../inspections.js"
import type * as inspections_v2 from "../inspections-v2.js"
import type * as pricing from "../pricing.js"
import type * as rag from "../rag.js"
import type * as rag_integration from "../rag-integration.js"
import type * as scheduling from "../scheduling.js"
import type * as searchSimilarInspections from "../searchSimilarInspections.js"
import type * as shops from "../shops.js"
import type * as users from "../users.js"
import type * as vehicles from "../vehicles.js"
import type * as workflows from "../workflows.js"
import type * as workflows_v2 from "../workflows-v2.js"
import type * as components from "../components.js"

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * \`\`\`js
 * const myFunctionReference = api.myModule.myFunction;
 * \`\`\`
 */
export const api: ApiFromModules<{
  addKnowledgeBase: typeof addKnowledgeBase
  ai: typeof ai
  attachments: typeof attachments
  customers: typeof customers
  fetchInspectionsByEmbedding: typeof fetchInspectionsByEmbedding
  files: typeof files
  inspections: typeof inspections
  "inspections-v2": typeof inspections_v2
  pricing: typeof pricing
  rag: typeof rag
  "rag-integration": typeof rag_integration
  scheduling: typeof scheduling
  searchSimilarInspections: typeof searchSimilarInspections
  shops: typeof shops
  users: typeof users
  vehicles: typeof vehicles
  workflows: typeof workflows
  "workflows-v2": typeof workflows_v2
  components: typeof components
}> = {} as any

// Create a proxy that allows property access but throws on function calls
const createStubProxy = (path: string[] = []): any => {
  return new Proxy(() => {}, {
    get(target, prop) {
      if (typeof prop === "string") {
        return createStubProxy([...path, prop])
      }
      return undefined
    },
    apply() {
      throw new Error(
        `api proxy is a stub in this build. Run "npx convex dev" or deploy with Convex enabled to use server functions.\n\nAttempted to call: api.${path.join(".")}`,
      )
    },
  })
}

// Only use stub in build environments
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  Object.assign(api, createStubProxy())
}
