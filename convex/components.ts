import { query } from "./_generated/server"

/**
 * A no-op stub so `api.components.hello` exists at runtime.
 * Replace with your real components-module functions later.
 */
export const hello = query({
  args: {},
  handler: async () => {
    return "hello from components stub"
  },
})
