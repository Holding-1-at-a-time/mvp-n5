/**
 * Centralised Slack alert helper.
 * (Re-exported for reuse inside the individual check* helpers below.)
 */
async function sendSlackAlert(params: {
  text: string
  color: "good" | "warning" | "danger"
  fields: Array<{ title: string; value: string; short: boolean }>
}) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: params.text,
      attachments: [
        {
          color: params.color,
          fields: params.fields,
          footer: "Slick Solutions Vehicle Inspection",
          ts: Math.floor(Date.now() / 1_000),
        },
      ],
    }),
  })
}

/* ------------------------------------------------------------------ */
/*                     GENERIC - LEVEL METRIC ALERTS                  */
/* ------------------------------------------------------------------ */

export async function checkEmbeddingLatency(latency: number, ctx?: Record<string, any>) {
  const threshold = 2_000
  if (latency <= threshold) return

  await sendSlackAlert({
    text: `🚨 Embedding latency ${latency} ms (>${threshold})`,
    color: "danger",
    fields: [
      { title: "Latency", value: `${latency} ms`, short: true },
      { title: "Threshold", value: `${threshold} ms`, short: true },
      { title: "Model", value: ctx?.model ?? "unknown", short: true },
    ],
  })
}

export async function checkWorkflowFailureRate(rate: number, ctx?: Record<string, any>) {
  const threshold = 0.3 // 30 %
  if (rate < threshold) return

  await sendSlackAlert({
    text: `🚨 Workflow failure rate ${(rate * 100).toFixed(0)} % (>${threshold * 100} %)`,
    color: "danger",
    fields: [
      { title: "Failures", value: String(ctx?.failures ?? "-"), short: true },
      { title: "Total", value: String(ctx?.totalRequests ?? "-"), short: true },
      { title: "Window", value: ctx?.timeWindow ?? "-", short: true },
    ],
  })
}

export async function checkApiResponseTime(time: number, ctx?: Record<string, any>) {
  const threshold = 1_000
  if (time <= threshold) return

  await sendSlackAlert({
    text: `⚠️  Slow API response ${time} ms (>${threshold})`,
    color: "warning",
    fields: [
      { title: "Route", value: ctx?.route ?? "unknown", short: true },
      { title: "Method", value: ctx?.method ?? "GET", short: true },
      { title: "Duration", value: `${time} ms`, short: true },
    ],
  })
}

export async function checkAssessmentConfidence(conf: number, ctx?: Record<string, any>) {
  const threshold = 0.6
  if (conf >= threshold) return

  await sendSlackAlert({
    text: `⚠️  Low AI assessment confidence ${(conf * 100).toFixed(1)} %`,
    color: "warning",
    fields: [
      { title: "Confidence", value: `${(conf * 100).toFixed(1)} %`, short: true },
      { title: "Images", value: String(ctx?.imageCount ?? "-"), short: true },
    ],
  })
}

export async function checkUploadFailureRate(rate: number, ctx?: Record<string, any>) {
  const threshold = 0.15 // 15 %
  if (rate < threshold) return

  await sendSlackAlert({
    text: `🚨 Upload failure rate ${(rate * 100).toFixed(0)} %`,
    color: "danger",
    fields: [
      { title: "Failures", value: String(ctx?.failures ?? "-"), short: true },
      { title: "Total", value: String(ctx?.totalRequests ?? "-"), short: true },
      { title: "Window", value: ctx?.timeWindow ?? "-", short: true },
    ],
  })
}

/* ------------------------------------------------------------------ */
/*                 EXISTING OLLAMA-SPECIFIC CHECKS                     */
/* ------------------------------------------------------------------ */

export async function checkOllamaLatency(latency: number, ctx?: Record<string, any>) {
  const threshold = 2_000
  if (latency <= threshold) return

  await sendSlackAlert({
    text: `🚨 Ollama latency alert ${latency} ms`,
    color: "danger",
    fields: [
      { title: "Latency", value: `${latency} ms`, short: true },
      { title: "Model", value: ctx?.model ?? "unknown", short: true },
      { title: "Operation", value: ctx?.operation ?? "unknown", short: true },
    ],
  })
}

export async function checkOllamaHealth(isHealthy: boolean, ctx?: Record<string, any>) {
  if (isHealthy) return

  await sendSlackAlert({
    text: `🚨 Ollama health check failed`,
    color: "danger",
    fields: [
      { title: "URL", value: ctx?.url ?? "-", short: true },
      { title: "Error", value: ctx?.error ?? "-", short: false },
    ],
  })
}

export async function checkVisionModelAccuracy(confidence: number, ctx?: Record<string, any>) {
  const threshold = 0.6
  if (confidence >= threshold) return

  await sendSlackAlert({
    text: `⚠️  Low vision model confidence ${(confidence * 100).toFixed(1)} %`,
    color: "warning",
    fields: [
      { title: "Confidence", value: `${(confidence * 100).toFixed(1)} %`, short: true },
      { title: "Damages", value: String(ctx?.damageCount ?? "-"), short: true },
    ],
  })
}
