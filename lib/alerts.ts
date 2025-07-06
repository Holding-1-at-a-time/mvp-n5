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
