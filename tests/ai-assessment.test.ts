import { describe, it, expect } from "@jest/globals"
import { NextRequest } from "next/server"
import { POST, GET } from "../app/api/ai/v1/assess/route"

describe("AI Assessment API", () => {
  describe("POST /api/ai/v1/assess", () => {
    it("should return valid assessment for valid request", async () => {
      const requestBody = {
        imageUrls: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
          "https://example.com/image3.jpg",
        ],
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
      expect(responseTime).toBeLessThan(500) // Response time < 500ms

      const data = await response.json()

      // Validate response schema
      expect(data.success).toBe(true)
      expect(data.assessmentId).toBeDefined()
      expect(data.vinNumber).toBe("1HGBH41JXMN109186")
      expect(Array.isArray(data.damages)).toBe(true)
      expect(Array.isArray(data.estimateItems)).toBe(true)
      expect(typeof data.totalEstimate).toBe("number")
      expect(data.confidence).toBeGreaterThan(0)
      expect(data.confidence).toBeLessThanOrEqual(1)
      expect(data.metadata.modelVersion).toBe("granite3.2-vision:latest")
      expect(data.metadata.imageCount).toBe(3)
    })

    it("should reject invalid VIN number", async () => {
      const requestBody = {
        imageUrls: ["https://example.com/image1.jpg"],
        vinNumber: "INVALID_VIN", // Invalid VIN
        metadata: {},
      }

      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe("Invalid request format")
    })

    it("should reject empty image array", async () => {
      const requestBody = {
        imageUrls: [], // Empty array
        vinNumber: "1HGBH41JXMN109186",
        metadata: {},
      }

      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it("should handle processing errors gracefully", async () => {
      const requestBody = {
        imageUrls: ["invalid-url"], // Invalid URL format
        vinNumber: "1HGBH41JXMN109186",
        metadata: {},
      }

      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe("GET /api/ai/v1/assess", () => {
    it("should return health check status", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/v1/assess", {
        method: "GET",
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.status).toBe("healthy")
      expect(data.service).toBe("ai-assessment")
      expect(data.model).toBe("granite3.2-vision:latest")
      expect(data.timestamp).toBeDefined()
    })
  })
})
