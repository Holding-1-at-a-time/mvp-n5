import * as Sentry from "@sentry/node"
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

/**
 * Generic metric tracker: records a metric to Sentry **and** runs
 * threshold-based checks that can trigger Slack alerts.
 */
export async function trackMetric(name: string, value: number, tags?: Record<string, any>) {
  try {
    Sentry.captureMessage(name, {
      level: "info",
      extra: { value, ...tags },
    })

    /* ---------------- Threshold-based alert fan-out ----------------- */
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

    await storeMetricForFailureRate(name, value, tags)
  } catch (err) {
    console.error("Failed to track metric", err)
  }
}

/**
 * Convenience wrapper for HTTP/API instrumentation – keeps external imports
 * stable that expected a `trackApiCall()` helper.
 */
export async function trackApiCall(route: string, durationMs: number, method = "GET") {
  await trackMetric("api.response_time", durationMs, { route, method })
}

/* ---------------- Failure-rate rolling window -------------------- */

const recent: Record<string, Array<{ ts: number; success: boolean }>> = {}

async function storeMetricForFailureRate(name: string, _value: number, tags?: Record<string, any>) {
  const success = tags?.success === true || name.includes("success")
  const failure = tags?.error === true || name.includes("error")

  if (!success && !failure) return

  const key = name.split(".")[0] // eg "workflow"
  const now = Date.now()
  const fiveMinAgo = now - 5 * 60 * 1_000

  recent[key] ||= []
  recent[key].push({ ts: now, success })

  // prune old
  recent[key] = recent[key].filter((m) => m.ts > fiveMinAgo)

  if (recent[key].length < 10) return

  const failures = recent[key].filter((m) => !m.success).length
  const rate = failures / recent[key].length

  if (key === "workflow") {
    await checkWorkflowFailureRate(rate, {
      totalRequests: recent[key].length,
      failures,
      timeWindow: "5 min",
    })
  } else if (key === "upload") {
    await checkUploadFailureRate(rate, {
      totalRequests: recent[key].length,
      failures,
      timeWindow: "5 min",
    })
  }
}
