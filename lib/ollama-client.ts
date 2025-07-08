// Dedicated Ollama client with connection pooling and error handling
export class OllamaClient {
  private baseUrl: string
  private timeout: number
  private retries: number

  constructor(baseUrl: string = process.env.OLLAMA_BASE_URL || "http://localhost:11434") {
    this.baseUrl = baseUrl
    this.timeout = 30000 // 30 seconds
    this.retries = 3
  }

  async generateVision(model: string, prompt: string, images: Buffer[]): Promise<string> {
    const payload = {
      model,
      prompt,
      images: images.map((buffer) => buffer.toString("base64")),
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
      },
    }

    return this.makeRequest("/api/generate", payload)
  }

  async generateEmbeddings(model: string, text: string): Promise<number[]> {
    const payload = {
      model,
      prompt: text,
    }

    const result = await this.makeRequest("/api/embeddings", payload)
    return result.embedding
  }

  async listModels(): Promise<any[]> {
    const result = await this.makeRequest("/api/tags", null, "GET")
    return result.models || []
  }

  private async makeRequest(endpoint: string, payload: any, method = "POST"): Promise<any> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: method === "POST" ? { "Content-Type": "application/json" } : {},
          body: method === "POST" ? JSON.stringify(payload) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error")

        if (attempt < this.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
          console.log(`Ollama request attempt ${attempt} failed, retrying in ${delay}ms...`)
        }
      }
    }

    throw lastError || new Error("All retry attempts failed")
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.listModels()
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const ollamaClient = new OllamaClient()
