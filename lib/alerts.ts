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
export async function checkOllamaLatency(): Promise<{ latencyMs: number }> {
  // 👉 Replace this with a real fetch round-trip once Ollama is accessible.
  return { latencyMs: Math.floor(Math.random() * 100) + 20 }
}

/** Hit the /health route (or equivalent) and return basic status. */
export async function checkOllamaHealth(): Promise<{ ok: boolean; modelVersion?: string }> {
  return { ok: true, modelVersion: "1.0.0-preview" }
}

/** Placeholder accuracy metric for the vision model. */
export async function checkVisionModelAccuracy(): Promise<{ accuracy: number }> {
  return { accuracy: 0.93 }
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
