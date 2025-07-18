import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

/**
 * To force-enable strict validation in CI / production,
 * leave SKIP_ENV_VALIDATION unset.
 * For quick local or preview spins you may set:
 *    SKIP_ENV_VALIDATION=true
 */
const skipValidation = process.env.SKIP_ENV_VALIDATION === "true"

export const env = createEnv({
  /**
   * Server-side variables (never exposed to the browser)
   */
  server: {
    /* ---------- REQUIRED ---------- */
    // Nothing is required for preview; add your own must-haves here.
    /* ---------- OPTIONAL ---------- */
    CLERK_SECRET_KEY: z.string().optional(),
    SVIX_API_KEY: z.string().optional(),
    SVIX_ENV_ID: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().url().optional(),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
    OLLAMA_VISION_MODEL: z.string().default("llava:7b"),
    OLLAMA_EMBED_MODEL: z.string().default("nomic-embed-text"),
  },

  /**
   * Client-side variables (exposed to the browser – MUST be prefixed with NEXT_PUBLIC_)
   */
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  },

  /**
   * Wire up process.env ⇢ runtime validation
   */
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
  /**
   * Skip validation when the flag is set – useful for preview deploys
   * that don’t have all secrets wired yet.
   */
  skipValidation,
})

export const isDev = process.env.NODE_ENV !== "production"
export const isProd = !isDev
