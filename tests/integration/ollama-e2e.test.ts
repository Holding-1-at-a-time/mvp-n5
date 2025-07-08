import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"
import { spawn, type ChildProcess } from "child_process"
import fetch from "node-fetch"

describe("Ollama End-to-End Integration Tests", () => {
  let ollamaProcess: ChildProcess | null = null
  const OLLAMA_URL = "http://localhost:11434"
  const API_URL = "http://localhost:3000"

  beforeAll(async () => {
    // Start Ollama service for testing
    console.log("Starting Ollama service...")
    ollamaProcess = spawn("ollama", ["serve"], {
      stdio: "pipe",
      env: { ...process.env, OLLAMA_HOST: "0.0.0.0:11434" },
    })

    // Wait for Ollama to be ready
    await waitForService(OLLAMA_URL, 30000)

    // Ensure required models are available
    await ensureModelsAvailable()
  }, 60000)

  afterAll(async () => {
    if (ollamaProcess) {
      ollamaProcess.kill("SIGTERM")
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  })

  async function waitForService(url: string, timeout: number): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(`${url}/api/tags`)
        if (response.ok) {
          console.log("Ollama service is ready")
          return
        }
      } catch (error) {
        // Service not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    throw new Error(`Service at ${url} did not become ready within ${timeout}ms`)
  }

  async function ensureModelsAvailable(): Promise<void> {
    console.log("Checking available models...")
    const response = await fetch(`${OLLAMA_URL}/api/tags`)
    const data = await response.json()
    const models = data.models || []

    const requiredModels = ["llama3.2-vision", "mxbai-embed-large"]
    const availableModels = models.map((m: any) => m.name.split(":")[0])

    for (const model of requiredModels) {
      if (!availableModels.includes(model)) {
        console.log(`Pulling required model: ${model}`)
        const pullResponse = await fetch(`${OLLAMA_URL}/api/pull`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: model }),
        })

        if (!pullResponse.ok) {
          throw new Error(`Failed to pull model ${model}`)
        }

        // Wait for model to be pulled (this can take a while)
        await new Promise((resolve) => setTimeout(resolve, 30000))
      }
    }
    console.log("All required models are available")
  }

  describe("Health Check", () => {
    it("should return healthy status when Ollama is running", async () => {
      const response = await fetch(`${API_URL}/api/ai/v1/assess`, {
        method: "GET",
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.status).toBe("healthy")
      expect(data.service).toBe("ollama-ai-assessment")
      expect(data.models.vision).toBe("llama3.2-vision")
      expect(data.models.embedding).toBe("mxbai-embed-large")
      expect(data.ollama.healthy).toBe(true)
    })
  })

  describe("Damage Assessment", () => {
    it("should process vehicle images and return damage assessment", async () => {
      // Use placeholder images for testing
      const testRequest = {
        imageUrls: [
          "https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Vehicle+Front",
          "https://via.placeholder.com/800x600/00FF00/FFFFFF?text=Vehicle+Side",
        ],
        vinNumber: "1HGBH41JXMN109186",
        metadata: {
          inspectionId: "test_e2e_001",
          timestamp: Date.now(),
        },
      }

      const startTime = Date.now()
      const response = await fetch(`${API_URL}/api/ai/v1/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequest),
      })
      const endTime = Date.now()

      expect(response.status).toBe(200)

      const data = await response.json()

      // Validate response structure
      expect(data.success).toBe(true)
      expect(data.assessmentId).toBeDefined()
      expect(data.vinNumber).toBe("1HGBH41JXMN109186")
      expect(Array.isArray(data.damages)).toBe(true)
      expect(Array.isArray(data.embeddings)).toBe(true)
      expect(typeof data.totalEstimate).toBe("number")
      expect(data.confidence).toBeGreaterThanOrEqual(0)
      expect(data.confidence).toBeLessThanOrEqual(1)
      expect(data.processingTimeMs).toBeGreaterThan(0)
      expect(data.processingTimeMs).toBeLessThan(30000) // Should complete within 30 seconds

      // Validate metadata
      expect(data.metadata.modelVersion).toContain("llama3.2-vision")
      expect(data.metadata.modelVersion).toContain("mxbai-embed-large")
      expect(data.metadata.imageCount).toBe(2)
      expect(data.metadata.ollamaLatency).toBeGreaterThan(0)
      expect(data.metadata.embeddingLatency).toBeGreaterThan(0)

      // Validate damage objects (if any)
      data.damages.forEach((damage: any) => {
        expect(damage.id).toBeDefined()
        expect(damage.type).toBeDefined()
        expect(damage.severity).toMatch(/^(minor|moderate|severe)$/)
        expect(damage.location).toBeDefined()
        expect(damage.description).toBeDefined()
        expect(damage.confidence).toBeGreaterThan(0)
        expect(damage.confidence).toBeLessThanOrEqual(1)
        expect(damage.boundingBox).toBeDefined()
        expect(damage.boundingBox.x).toBeGreaterThanOrEqual(0)
        expect(damage.boundingBox.y).toBeGreaterThanOrEqual(0)
        expect(damage.boundingBox.width).toBeGreaterThan(0)
        expect(damage.boundingBox.height).toBeGreaterThan(0)
      })

      console.log(`E2E test completed in ${endTime - startTime}ms`)
      console.log(`Found ${data.damages.length} damages with ${Math.round(data.confidence * 100)}% confidence`)
    }, 60000) // Allow up to 60 seconds for this test

    it("should handle invalid VIN numbers", async () => {
      const testRequest = {
        imageUrls: ["https://via.placeholder.com/800x600"],
        vinNumber: "INVALID_VIN", // Invalid VIN
      }

      const response = await fetch(`${API_URL}/api/ai/v1/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequest),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe("Invalid request format")
      expect(data.details).toBeDefined()
    })

    it("should handle empty image arrays", async () => {
      const testRequest = {
        imageUrls: [], // Empty array
        vinNumber: "1HGBH41JXMN109186",
      }

      const response = await fetch(`${API_URL}/api/ai/v1/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequest),
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe("Invalid request format")
    })

    it("should handle network timeouts gracefully", async () => {
      // Test with a very slow/non-existent image URL
      const testRequest = {
        imageUrls: ["https://httpstat.us/200?sleep=35000"], // 35 second delay
        vinNumber: "1HGBH41JXMN109186",
      }

      const response = await fetch(`${API_URL}/api/ai/v1/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequest),
      })

      // Should return an error due to timeout
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe("Internal server error during assessment")
    }, 40000)
  })

  describe("Performance Benchmarks", () => {
    it("should process single image within performance thresholds", async () => {
      const testRequest = {
        imageUrls: ["https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Performance+Test"],
        vinNumber: "1HGBH41JXMN109186",
      }

      const startTime = Date.now()
      const response = await fetch(`${API_URL}/api/ai/v1/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequest),
      })
      const endTime = Date.now()

      expect(response.status).toBe(200)

      const data = await response.json()
      const totalTime = endTime - startTime

      // Performance assertions
      expect(totalTime).toBeLessThan(10000) // Should complete within 10 seconds
      expect(data.metadata.ollamaLatency).toBeLessThan(5000) // Vision processing < 5s
      expect(data.metadata.embeddingLatency).toBeLessThan(2000) // Embedding generation < 2s

      console.log(`Performance test results:`)
      console.log(`  Total time: ${totalTime}ms`)
      console.log(`  Ollama latency: ${data.metadata.ollamaLatency}ms`)
      console.log(`  Embedding latency: ${data.metadata.embeddingLatency}ms`)
    }, 15000)

    it("should handle multiple concurrent requests", async () => {
      const testRequest = {
        imageUrls: ["https://via.placeholder.com/800x600/FFFF00/000000?text=Concurrent+Test"],
        vinNumber: "1HGBH41JXMN109186",
      }

      // Send 3 concurrent requests
      const promises = Array(3)
        .fill(null)
        .map(() =>
          fetch(`${API_URL}/api/ai/v1/assess`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(testRequest),
          }),
        )

      const startTime = Date.now()
      const responses = await Promise.all(promises)
      const endTime = Date.now()

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200)
      })

      const totalTime = endTime - startTime
      console.log(`Concurrent requests completed in ${totalTime}ms`)

      // Concurrent processing should not take significantly longer than sequential
      expect(totalTime).toBeLessThan(20000) // Should complete within 20 seconds
    }, 30000)
  })
})
