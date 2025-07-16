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
const internalApiStub: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = makeDeepProxy()

/* ---------- Runtime stubs (improved by v0) ----------
 * These proxies let the bundle compile and run in Preview / CI environments
 * where Convex isn’t available.  Accessing paths like `api.foo.bar` is fine,
 * but **calling** the function will throw with a clear message.
 * Run `npx convex dev` locally or deploy with Convex enabled to get the
 * fully-featured client.
 */

function makeDeepProxy(path: string[] = []): any {
  return new Proxy(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
    {
      get(_, prop) {
        // Special cases to keep tooling / React happy
        if (prop === "then") return undefined // allow `await api.foo`
        if (prop === Symbol.toStringTag) return "ConvexFunctionReference"

        // Build a longer path as we traverse
        return makeDeepProxy([...path, String(prop)])
      },
      apply() {
        throw new Error(
          `api proxy is a stub in this build. Tried to invoke "${path.join(
            ".",
          )}".\nRun "npx convex dev" or deploy with Convex enabled to use server functions.`,
        )
      },
    },
  )
}

// Runtime (value) exports
// These satisfy imports like `import { api } from "@/convex/_generated/api"`
export const api = makeDeepProxy()
export const internalApi = internalApiStub
// Keep an empty components object to satisfy any stray import
export const components = {}
/* ---------------------------------------------------- */
