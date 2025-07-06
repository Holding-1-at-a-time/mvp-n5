"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface AssessmentRequest {
  imageUrls: string[]
  vinNumber: string
  metadata?: {
    inspectionId?: string
    timestamp?: number
  }
}

interface Damage {
  id: string
  type: string
  severity: string
  location: string
  description: string
  confidence: number
  imageUrl: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  embedding?: number[]
}

interface AssessmentResponse {
  success: boolean
  assessmentId: string
  vinNumber: string
  damages: Damage[]
  embeddings: number[][]
  totalEstimate: number
  processingTimeMs: number
  confidence: number
  metadata: {
    modelVersion: string
    processedAt: string
    imageCount: number
    ollamaLatency: number
    embeddingLatency: number
  }
}

interface AssessmentError {
  success: false
  error: string
  processingTimeMs: number
  details?: any[]
}

export function useOllamaAssessment() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastAssessment, setLastAssessment] = useState<AssessmentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const assessDamage = useCallback(async (request: AssessmentRequest): Promise<AssessmentResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/v1/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      const data: AssessmentResponse | AssessmentError = await response.json()

      if (!response.ok || !data.success) {
        const errorData = data as AssessmentError
        throw new Error(errorData.error || "Assessment failed")
      }

      const successData = data as AssessmentResponse
      setLastAssessment(successData)

      // Show success toast with processing time
      toast.success(`Assessment completed in ${successData.processingTimeMs}ms`, {
        description: `Found ${successData.damages.length} damages with ${Math.round(successData.confidence * 100)}% confidence`,
      })

      return successData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)

      toast.error("Assessment failed", {
        description: errorMessage,
      })

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/ai/v1/assess", {
        method: "GET",
      })

      const data = await response.json()
      return data.status === "healthy"
    } catch {
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setLastAssessment(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    assessDamage,
    checkHealth,
    reset,
    isLoading,
    lastAssessment,
    error,
    // Computed values
    damageCount: lastAssessment?.damages.length || 0,
    totalEstimate: lastAssessment?.totalEstimate || 0,
    confidence: lastAssessment?.confidence || 0,
    processingTime: lastAssessment?.processingTimeMs || 0,
  }
}
