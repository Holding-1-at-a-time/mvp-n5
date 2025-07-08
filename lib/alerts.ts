/* ------------------------------------------------------------------ */
/* Generic metric alert helpers                                       */
/* ------------------------------------------------------------------ */

export async function checkEmbeddingLatency(latency: number, context?: Record<string, any>) {
  const threshold = 3_000 // 3 s
  if (latency > threshold) {
    await sendSlackAlert({
      text: `🚨 Embedding latency ${latency} ms (>${threshold} ms)`,
      color: "danger",
      fields: [
        { title: "Latency", value: `${latency} ms`, short: true },
        { title: "Threshold", value: `${threshold} ms`, short: true },
        { title: "Model", value: context?.model ?? "unknown", short: true },
      ],
    })
  }
}

export async function checkWorkflowFailureRate(failureRate: number, context?: Record<string, any>) {
  const threshold = 0.2 // 20 %
  if (failureRate > threshold) {
    await sendSlackAlert({
      text: `🚨 Workflow failure-rate ${(failureRate * 100).toFixed(1)} % (>20 %)`,
      color: "danger",
      fields: [
        { title: "Failure-rate", value: `${(failureRate * 100).toFixed(1)} %`, short: true },
        { title: "Window", value: context?.timeWindow ?? "unknown", short: true },
        { title: "Failures", value: context?.failures?.toString() ?? "?", short: true },
        { title: "Total", value: context?.totalRequests?.toString() ?? "?", short: true },
      ],
    })
  }
}

export async function checkApiResponseTime(duration: number, context?: Record<string, any>) {
  const threshold = 1_500 // 1.5 s
  if (duration > threshold) {
    await sendSlackAlert({
      text: `⚠️ Slow API response ${duration} ms (>${threshold} ms)`,
      color: "warning",
      fields: [
        { title: "Duration", value: `${duration} ms`, short: true },
        { title: "Endpoint", value: context?.endpoint ?? "unknown", short: false },
      ],
    })
  }
}

export async function checkAssessmentConfidence(confidence: number, context?: Record<string, any>) {
  const threshold = 0.7
  if (confidence < threshold) {
    await sendSlackAlert({
      text: `⚠️ Low assessment confidence ${(confidence * 100).toFixed(1)} %`,
      color: "warning",
      fields: [
        { title: "Confidence", value: `${(confidence * 100).toFixed(1)} %`, short: true },
        { title: "Threshold", value: `${(threshold * 100).toFixed(0)} %`, short: true },
      ],
    })
  }
}

export async function checkUploadFailureRate(failureRate: number, context?: Record<string, any>) {
  const threshold = 0.1 // 10 %
  if (failureRate > threshold) {
    await sendSlackAlert({
      text: `🚨 Upload failure-rate ${(failureRate * 100).toFixed(1)} % (>10 %)`,
      color: "danger",
      fields: [
        { title: "Failure-rate", value: `${(failureRate * 100).toFixed(1)} %`, short: true },
        { title: "Window", value: context?.timeWindow ?? "unknown", short: true },
        { title: "Failures", value: context?.failures?.toString() ?? "?", short: true },
        { title: "Total", value: context?.totalRequests?.toString() ?? "?", short: true },
      ],
    })
  }
}

// Add these new alert functions to the existing file

export async function checkOllamaLatency(latency: number, context?: Record<string, any>) {
  const threshold = 2000 // 2 seconds

  if (latency > threshold) {
    const message = `🚨 Ollama latency alert: ${latency}ms (threshold: ${threshold}ms)`

    console.error(message, context)

    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert({
        text: message,
        color: "danger",
        fields: [
          { title: "Latency", value: `${latency}ms`, short: true },
          { title: "Threshold", value: `${threshold}ms`, short: true },
          { title: "Model", value: context?.model || "unknown", short: true },
          { title: "Operation", value: context?.operation || "unknown", short: true },
        ],
      })
    }
  }
}

export async function checkOllamaHealth(isHealthy: boolean, context?: Record<string, any>) {
  if (!isHealthy) {
    const message = `🚨 Ollama health check failed`

    console.error(message, context)

    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert({
        text: message,
        color: "danger",
        fields: [
          { title: "Service", value: "Ollama", short: true },
          { title: "Status", value: "Unhealthy", short: true },
          { title: "URL", value: context?.url || "unknown", short: true },
          { title: "Error", value: context?.error || "Connection failed", short: false },
        ],
      })
    }
  }
}

export async function checkVisionModelAccuracy(confidence: number, context?: Record<string, any>) {
  const threshold = 0.6 // 60% confidence threshold

  if (confidence < threshold) {
    const message = `⚠️ Low vision model confidence: ${Math.round(confidence * 100)}% (threshold: ${Math.round(threshold * 100)}%)`

    console.warn(message, context)

    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert({
        text: message,
        color: "warning",
        fields: [
          { title: "Confidence", value: `${Math.round(confidence * 100)}%`, short: true },
          { title: "Threshold", value: `${Math.round(threshold * 100)}%`, short: true },
          { title: "Damages Found", value: context?.damageCount?.toString() || "0", short: true },
          { title: "Images", value: context?.imageCount?.toString() || "0", short: true },
        ],
      })
    }
  }
}

// Helper function to send Slack alerts
async function sendSlackAlert(alertData: {
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
