import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

let env: ReturnType<typeof createEnv>
export const isDev = process.env.NODE_ENV !== "production"
export const isProd = process.env.NODE_ENV === "production"

try {
  env = createEnv({
    server: {
      // absolutely required for critical server paths
      // (add more here if your runtime really can’t continue without them)
      OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
      OLLAMA_VISION_MODEL: z.string().default("llava:7b"),
      OLLAMA_EMBED_MODEL: z.string().default("nomic-embed-text"),

      // ───────── OPTIONAL / NICE-TO-HAVE ─────────
      CLERK_SECRET_KEY: z.string().optional(),
      SVIX_API_KEY: z.string().optional(),
      SVIX_ENV_ID: z.string().optional(),
      SLACK_WEBHOOK_URL: z.string().url().optional(),
      SENTRY_DSN: z.string().optional(),
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
      SENTRY_AUTH_TOKEN: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_CONVEX_URL: z.string().url(),
      NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

      // Optional for local previews
      NEXT_PUBLIC_CLERK_PUBLISHable_KEY: z.string().optional(),
    },
    runtimeEnv: {
      // client
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

      // server
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      SVIX_API_KEY: process.env.SVIX_API_KEY,
      SVIX_ENV_ID: process.env.SVIX_ENV_ID,
      SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
      OLLAMA_VISION_MODEL: process.env.OLLAMA_VISION_MODEL,
      OLLAMA_EMBED_MODEL: process.env.OLLAMA_EMBED_MODEL,
    },
    emptyStringAsUndefined: true,
  })
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("[env] Invalid environment configuration. Falling back to process.env.\n", (error as Error).message)
  // minimal fallback so Next.js can still boot in dev/preview
  env = {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  } as unknown as typeof env
}

export { env }
