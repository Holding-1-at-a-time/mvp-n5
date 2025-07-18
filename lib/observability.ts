import {
  checkEmbeddingLatency,
  checkWorkflowFailureRate,
  checkApiResponseTime,
  checkAssessmentConfidence,
  checkUploadFailureRate,
  checkOllamaLatency,
  checkOllamaHealth,
  checkVisionModelAccuracy,
} from "./alerts"

import * as Sentry from "@sentry/node"

export async function trackMetric(name: string, value: number, tags?: Record<string, any>) {
  try {
    Sentry.captureMessage(name, {
      level: "info",
      extra: {
        value,
        ...tags,
      },
    })

    // Check for alert thresholds
    if (name === "embedding.latency") {
      await checkEmbeddingLatency(value, tags)
    } else if (name === "api.response_time") {
      await checkApiResponseTime(value, tags)
    } else if (name === "assessment.confidence") {
      await checkAssessmentConfidence(value, tags)
    } else if (name === "ai.vision_latency" || name === "ai.embedding_latency") {
      await checkOllamaLatency(value, { ...tags, operation: name })
    } else if (name === "ai.vision_error" || name === "ai.embedding_error") {
      await checkOllamaHealth(false, { ...tags, error: tags?.error })
    } else if (name === "ai.assessment_success" && tags?.confidence) {
      await checkVisionModelAccuracy(tags.confidence, tags)
    }

    // Store metrics for failure rate calculations
    await storeMetricForFailureRate(name, value, tags)
  } catch (error) {
    console.error("Failed to track metric:", error)
  }
}

/* ------------------------------------------------------------------ */
/* Error-tracking helper                                              */
/* ------------------------------------------------------------------ */

/**
 * Tiny wrapper around console/Sentry/etc. to avoid missing-export build errors.
 * Swap this out with your preferred monitoring stack in production.
 */

type ExtraContext = Record<string, unknown> | undefined

export function trackError(error: unknown, context: ExtraContext = {}): void {
  // Replace with real telemetry (e.g., Sentry.captureException).
  // Keeping it simple here to satisfy type & runtime checks.
  // eslint-disable-next-line no-console
  console.error("Tracked error:", error, "Context:", context)
}

// Store recent metrics for failure rate calculation
const recentMetrics = new Map<string, Array<{ timestamp: number; success: boolean }>>()

async function storeMetricForFailureRate(name: string, value: number, tags?: Record<string, any>) {
  const isFailureMetric = name.includes("error") || name.includes("failure") || tags?.error === true
  const isSuccessMetric = name.includes("success") || name.includes("complete") || tags?.success === true

  if (!isFailureMetric && !isSuccessMetric) return

  const key = name.split(".")[0] // e.g., 'workflow' from 'workflow.failure'
  const now = Date.now()
  const fiveMinutesAgo = now - 5 * 60 * 1000

  if (!recentMetrics.has(key)) {
    recentMetrics.set(key, [])
  }

  const metrics = recentMetrics.get(key)!

  // Add new metric
  metrics.push({
    timestamp: now,
    success: isSuccessMetric,
  })

  // Remove old metrics (older than 5 minutes)
  const filtered = metrics.filter((m) => m.timestamp > fiveMinutesAgo)
  recentMetrics.set(key, filtered)

  // Calculate failure rate if we have enough data
  if (filtered.length >= 10) {
    const failures = filtered.filter((m) => !m.success).length
    const failureRate = failures / filtered.length

    if (key === "workflow") {
      await checkWorkflowFailureRate(failureRate, {
        totalRequests: filtered.length,
        failures,
        timeWindow: "5min",
      })
    } else if (key === "upload") {
      await checkUploadFailureRate(failureRate, {
        totalRequests: filtered.length,
        failures,
        timeWindow: "5min",
      })
    }
  }
}
