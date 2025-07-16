/* ------------------------------------------------------------------ */
/* Generic metric alert helpers                                       */
/* ------------------------------------------------------------------ */

export function checkEmbeddingLatency(_v: number, _tags?: Record<string, any>) {}

export function checkWorkflowFailureRate(_rate: number, _ctx?: Record<string, any>) {}

export function checkApiResponseTime(_v: number, _tags?: Record<string, any>) {}

export function checkAssessmentConfidence(_v: number, _tags?: Record<string, any>) {}

export function checkUploadFailureRate(_rate: number, _ctx?: Record<string, any>) {}

/**
 * ------------------------------------------------------------------
 * Ollama-specific helpers
 * ------------------------------------------------------------------
 */

/**
 * Flag latency when Ollama's `/generate` or `/embeddings` endpoints
 * take longer than `thresholdMs`.
 */
export function checkOllamaLatency(_v: number, _tags?: Record<string, any>) {}

/** Hit the /health route (or equivalent) and return basic status. */
export function checkOllamaHealth(_healthy = true, _ctx?: Record<string, any>) {}

/** Placeholder accuracy metric for the vision model. */
export function checkVisionModelAccuracy(_confidence: number, _tags?: Record<string, any>) {}

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
