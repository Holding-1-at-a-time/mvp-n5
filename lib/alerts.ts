/* ------------------------------------------------------------------ */
/* Generic metric alert helpers                                       */
/* ------------------------------------------------------------------ */

export function checkEmbeddingLatency(latencyMs: number, thresholdMs = 2_000): boolean {
  return latencyMs > thresholdMs
}

export function checkWorkflowFailureRate(failures: number, total: number, maxFailurePct = 0.05): boolean {
  if (total === 0) return false
  return failures / total > maxFailurePct
}

export function checkApiResponseTime(latencyMs: number, thresholdMs = 1_000): boolean {
  return latencyMs > thresholdMs
}

export function checkAssessmentConfidence(confidence: number, minConfidence = 0.75): boolean {
  return confidence < minConfidence
}

export function checkUploadFailureRate(failures: number, total: number, maxFailurePct = 0.02): boolean {
  if (total === 0) return false
  return failures / total > maxFailurePct
}

/**
 * ------------------------------------------------------------------
 * Ollama-specific helpers
 * ------------------------------------------------------------------
 */

/**
 * Flag latency when Ollama's `/generate` or `/embeddings` endpoints
 * take longer than `thresholdMs`.
 */
export function checkOllamaLatency(latencyMs: number, thresholdMs = 3_000): boolean {
  return latencyMs > thresholdMs
}

/**
 * Simple health-check that pings `GET /` on the Ollama server.
 * Returns `true` when HTTP 200 <= status < 300.
 */
export async function checkOllamaHealth(
  /**
   * Base URL for your Ollama instance (defaults to env var or localhost).
   */
  baseUrl: string = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
): Promise<boolean> {
  try {
    const res = await fetch(baseUrl, { method: "GET" })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Trigger an alert when the rolling accuracy of your vision model
 * falls below the specified `minAccuracy` (e.g. 0.9 == 90 %).
 */
export function checkVisionModelAccuracy(accuracy: number, minAccuracy = 0.9): boolean {
  return accuracy < minAccuracy
}

export async function sendSlackAlert(alertData: {
  text: string
  color: string
  fields: Array<{ title: string; value: string; short: boolean }>
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured")
    return
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: alertData.text,
      attachments: [
        {
          color: alertData.color,
          fields: alertData.fields,
          footer: "Slick Solutions Vehicle Inspection",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  })
}
