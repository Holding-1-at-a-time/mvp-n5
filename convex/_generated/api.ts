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
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  files: typeof files
  inspections: typeof inspections
  workflows: typeof workflows
}>
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>
