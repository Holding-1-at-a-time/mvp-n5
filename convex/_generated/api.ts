/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server"
import type * as files from "../files.js"
import type * as inspections from "../inspections.js"
import type * as workflows from "../workflows.js"

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * \`\`\`js
 * const myFunctionReference = api.myModule.myFunction;
 * \`\`\`
 */
declare const fullApi: ApiFromModules<{
  files: typeof files
  inspections: typeof inspections
  workflows: typeof workflows
}>
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>

// ---------- Runtime stubs (added by v0) ----------
/**
 * During local development `convex dev` generates a fully-featured
 * implementation.  In preview/CI we expose no-op proxies so that
 * the app can bundle without Convex running.
 */
function makeNoopProxy(name: string) {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          `${name} proxy is a stub in this build. Run "npx convex dev" or deploy with Convex enabled to use server functions.`,
        )
      },
    },
  )
}

// Runtime (value) exports
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const apiRuntime = makeNoopProxy("api")
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const internalRuntime = makeNoopProxy("internal")

// Optional: keep empty components object to satisfy any stray import
export const components = {}

export const api = apiRuntime
export const internal = internalRuntime
// -------------------------------------------------
