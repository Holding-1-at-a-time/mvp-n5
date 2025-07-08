/**
 * Thin CommonJS/ES module wrapper so code that imports `convex/schema.js`
 * gets the same default export as the locked TypeScript file.
 * DO NOT MODIFY `convex/schema.ts` (it is locked).
 */

import schema from "./schema.js" assert { type: "typescript" }
// For environments that don’t understand the above import assertion
// fallback to dynamic import when necessary.
export default schema
