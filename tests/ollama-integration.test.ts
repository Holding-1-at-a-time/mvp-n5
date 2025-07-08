import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals"
import { NextRequest } from "next/server"
import { POST, GET } from "../app/api/ai/v1/assess/route"
import { ollamaClient } from "../lib/ollama-client"

// Mock fetch for testing
global.fetch = jest.fn()

describe("Ollama Integration Tests", () => {
  beforeAll(() => {
    // Set test environment variables
    process.env.OLLAMA_BASE_URL = "http://localhost:11434"
    process.env.OLLAMA_VISION_MODEL = "llama3.2-vision"
    process.env.OLLAMA_EMBED_MODEL = "mxbai-embed-large"
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe("OllamaClient", () => {
    it("should generate vision analysis", async () => {
      const mockResponse = {
        response: JSON.stringify([
          {
            type: "dent",
            severity: "moderate",
            location: "front bumper",
            description: "Small dent on front bumper",
            confidence: 0.85,
            bbox: [100, 150, 80, 60],
          },
        ]),
      }
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const imageBuffer = Buffer.from("fake-image-data")
      const result = await ollamaClient.generateVision("llama3.2-vision", "Analyze this image for damage", [
        imageBuffer,
      ])

      expect(result).toBe(mockResponse.response)
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:11434/api/generate",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      )
    })

    it("should generate embeddings", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ embedding: mockEmbedding }),
      } as Response)

      const result = await ollamaClient.generateEmbeddings("mxbai-embed-large", "dent moderate front bumper")

      expect(result).toEqual(mockEmbedding)
    })

    it("should handle connection errors with retries", async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error("Connection failed"))
        .mockRejectedValueOnce(new Error("Connection failed"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response: "success" }),
        } as Response)

      const imageBuffer = Buffer.from("fake-image-data")
      const result = await ollamaClient.generateVision("llama3.2-vision", "test prompt", [imageBuffer])

      expect(result).toBe("success")
      expect(fetch).toHaveBeenCalledTimes(3) // 2 failures + 1 success
    })

    it("should perform health check", async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] }),
      } as Response)

      const isHealthy = await ollamaClient.healthCheck()
      expect(isHealthy).toBe(true)
    })
  })

  describe("POST /api/ai/v1/assess", () => {
    it("should process images and return damage assessment", async () => {
      // Mock image fetch
      ;(fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(1024),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(1024),
        } as Response)
        // Mock Ollama vision call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: JSON.stringify([
              {
                type: "scratch",
                severity: "minor",
                location: "driver door",
                description: "Surface scratch on driver door",
                confidence: 0.9,
                bbox: [200, 300, 60, 40],
              },
            ]),
          }),
        } as Response)
        // Mock Ollama embedding call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
          }),
        } as Response)

      const requestBody = {
        imageUrls: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        vinNumber: "1HGBH41JXMN109186",
        metadata: {
          inspectionId: "test_123",
          timestamp: Date.now(),
        },
      }

      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(5000) // Allow more time for Ollama processing

      const data = await response.json()

      // Validate response structure
      expect(data.success).toBe(true)
      expect(data.assessmentId).toBeDefined()
      expect(data.vinNumber).toBe("1HGBH41JXMN109186")
      expect(Array.isArray(data.damages)).toBe(true)
      expect(Array.isArray(data.embeddings)).toBe(true)
      expect(typeof data.totalEstimate).toBe("number")
      expect(data.confidence).toBeGreaterThan(0)
      expect(data.confidence).toBeLessThanOrEqual(1)
      expect(data.metadata.modelVersion).toContain("llama3.2-vision")
      expect(data.metadata.imageCount).toBe(2)
      expect(data.metadata.ollamaLatency).toBeGreaterThan(0)
      expect(data.metadata.embeddingLatency).toBeGreaterThan(0)

      // Validate damage structure
      if (data.damages.length > 0) {
        const damage = data.damages[0]
        expect(damage.id).toBeDefined()
        expect(damage.type).toBeDefined()
        expect(damage.severity).toBeDefined()
        expect(damage.location).toBeDefined()
        expect(damage.description).toBeDefined()
        expect(damage.confidence).toBeGreaterThan(0)
        expect(damage.boundingBox).toBeDefined()
        expect(damage.boundingBox.x).toBeGreaterThanOrEqual(0)
        expect(damage.boundingBox.y).toBeGreaterThanOrEqual(0)
        expect(damage.boundingBox.width).toBeGreaterThan(0)
        expect(damage.boundingBox.height).toBeGreaterThan(0)
      }
    })

    it("should handle Ollama service unavailable", async () => {
      // Mock image fetch success
      ;(fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(1024),
        } as Response)
        // Mock Ollama service failure
        .mockRejectedValueOnce(new Error("Ollama service unavailable"))

      const requestBody = {
        imageUrls: ["https://example.com/image1.jpg"],
        vinNumber: "1HGBH41JXMN109186",
      }

      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe("Internal server error during assessment")
    })

    it("should validate request schema", async () => {
      const invalidRequestBody = {
        imageUrls: [], // Empty array should fail validation
        vinNumber: "INVALID", // Invalid VIN
      }

      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "POST",
        body: JSON.stringify(invalidRequestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe("Invalid request format")
      expect(data.details).toBeDefined()
    })
  })

  describe("GET /api/ai/v1/assess (Health Check)", () => {
    it("should return healthy status when Ollama is available", async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] }),
      } as Response)

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.status).toBe("healthy")
      expect(data.service).toBe("ollama-ai-assessment")
      expect(data.models.vision).toBe("llama3.2-vision")
      expect(data.models.embedding).toBe("mxbai-embed-large")
      expect(data.ollama.healthy).toBe(true)
    })

    it("should return degraded status when Ollama is unavailable", async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Connection refused"))

      const response = await GET()
      expect(response.status).toBe(503)

      const data = await response.json()
      expect(data.status).toBe("unhealthy")
      expect(data.error).toBeDefined()
    })
  })
})
