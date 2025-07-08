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

/* ------------------------------------------------------------------ */
/* Ollama-specific alert helpers                                      */
/* ------------------------------------------------------------------ */

export async function checkOllamaLatency(
  latencyMs: number,
  context: Record<string, any> = {},
  thresholdMs = 2_000, // 2 s
) {
  if (latencyMs <= thresholdMs) return
  await sendSlackAlert({
    text: `🚨 Ollama latency ${latencyMs} ms (>${thresholdMs} ms)`,
    color: "danger",
    fields: [
      { title: "Latency", value: `${latencyMs} ms`, short: true },
      { title: "Threshold", value: `${thresholdMs} ms`, short: true },
      { title: "Model", value: context.model ?? "unknown", short: true },
      { title: "Operation", value: context.operation ?? "unknown", short: true },
    ],
  })
}

export async function checkOllamaHealth(healthy: boolean, context: Record<string, any> = {}) {
  if (healthy) return
  await sendSlackAlert({
    text: "🚨 Ollama health check failed",
    color: "danger",
    fields: [
      { title: "Service", value: "Ollama", short: true },
      { title: "URL", value: context.url ?? "unknown", short: false },
      { title: "Error", value: context.error ?? "Connection failed", short: false },
    ],
  })
}

export async function checkVisionModelAccuracy(
  confidence: number,
  context: Record<string, any> = {},
  minConfidence = 0.6, // 60 %
) {
  if (confidence >= minConfidence) return
  await sendSlackAlert({
    text: `⚠️ Low vision-model confidence ${(confidence * 100).toFixed(1)} %`,
    color: "warning",
    fields: [
      { title: "Confidence", value: `${(confidence * 100).toFixed(1)} %`, short: true },
      { title: "Threshold", value: `${(minConfidence * 100).toFixed(0)} %`, short: true },
      { title: "Images", value: context.imageCount?.toString() ?? "0", short: true },
      { title: "Damages", value: context.damageCount?.toString() ?? "0", short: true },
    ],
  })
}
