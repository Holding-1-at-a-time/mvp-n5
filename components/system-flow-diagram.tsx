"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Camera,
  Scan,
  Brain,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Database,
  Smartphone,
} from "lucide-react"

interface FlowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "pending" | "processing" | "completed" | "error"
  duration?: number
  metrics?: Record<string, any>
}

interface SystemFlowDiagramProps {
  inspectionId?: string
  realTime?: boolean
  diagramCode?: string
}

export function SystemFlowDiagram({ inspectionId, realTime = false, diagramCode }: SystemFlowDiagramProps) {
  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: "capture",
      title: "Media Capture",
      description: "Photos and videos captured via mobile interface",
      icon: <Camera className="w-5 h-5" />,
      status: "pending",
      metrics: { photosRequired: 3, videoOptional: true },
    },
    {
      id: "vin",
      title: "VIN Processing",
      description: "Vehicle identification and specification lookup",
      icon: <Scan className="w-5 h-5" />,
      status: "pending",
      metrics: { nhtsaApiLatency: 0, vehicleDataPoints: 15 },
    },
    {
      id: "ai",
      title: "AI Analysis",
      description: "Damage detection and confidence scoring",
      icon: <Brain className="w-5 h-5" />,
      status: "pending",
      metrics: { confidenceThreshold: 0.7, damagesDetected: 0 },
    },
    {
      id: "estimation",
      title: "Cost Estimation",
      description: "Vehicle-specific pricing and labor calculations",
      icon: <Calculator className="w-5 h-5" />,
      status: "pending",
      metrics: { baseLaborRate: 85, vehicleModifiers: {} },
    },
    {
      id: "approval",
      title: "Workflow Approval",
      description: "Estimate review and scheduling integration",
      icon: <CheckCircle className="w-5 h-5" />,
      status: "pending",
      metrics: { approvalRequired: true, schedulingEnabled: true },
    },
  ])

  const [overallProgress, setOverallProgress] = useState(0)
  const [systemMetrics, setSystemMetrics] = useState({
    totalProcessingTime: 0,
    apiResponseTime: 0,
    aiConfidence: 0,
    estimateAccuracy: 0,
  })

  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!realTime) return

    const interval = setInterval(() => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps]
        const processingStep = newSteps.find((step) => step.status === "processing")
        const pendingStep = newSteps.find((step) => step.status === "pending")

        // Complete current processing step
        if (processingStep) {
          processingStep.status = "completed"
          processingStep.duration = Math.floor(Math.random() * 3000) + 1000 // 1-4 seconds

          // Update metrics based on step
          if (processingStep.id === "vin") {
            processingStep.metrics = {
              ...processingStep.metrics,
              nhtsaApiLatency: Math.floor(Math.random() * 200) + 100,
              vehicleFound: true,
            }
          } else if (processingStep.id === "ai") {
            processingStep.metrics = {
              ...processingStep.metrics,
              damagesDetected: Math.floor(Math.random() * 4) + 1,
              avgConfidence: 0.85 + Math.random() * 0.1,
            }
          }
        }

        // Start next pending step
        if (pendingStep && !processingStep) {
          pendingStep.status = "processing"
        }

        return newSteps
      })

      // Update overall progress
      setOverallProgress((prev) => {
        const completedSteps = steps.filter((step) => step.status === "completed").length
        const newProgress = (completedSteps / steps.length) * 100
        return Math.min(newProgress, 100)
      })

      // Update system metrics
      setSystemMetrics((prev) => ({
        totalProcessingTime: prev.totalProcessingTime + 1000,
        apiResponseTime: Math.floor(Math.random() * 200) + 200,
        aiConfidence: 0.85 + Math.random() * 0.1,
        estimateAccuracy: 0.92 + Math.random() * 0.05,
      }))
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [realTime, steps])

  useEffect(() => {
    if (mermaidRef.current && diagramCode) {
      mermaid.initialize({ startOnLoad: false })
      mermaid.render("flowchart-diagram", diagramCode).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg
        }
      })
    }
  }, [diagramCode])

  const getStatusColor = (status: FlowStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500 animate-pulse"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusBadge = (status: FlowStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Vehicle Inspection System Flow
            {realTime && (
              <Badge variant="outline" className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />

            {/* System Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(systemMetrics.totalProcessingTime / 1000)}s
                </div>
                <div className="text-xs text-gray-600">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemMetrics.apiResponseTime}ms</div>
                <div className="text-xs text-gray-600">API Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(systemMetrics.aiConfidence * 100)}%
                </div>
                <div className="text-xs text-gray-600">AI Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(systemMetrics.estimateAccuracy * 100)}%
                </div>
                <div className="text-xs text-gray-600">Estimate Accuracy</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Step Indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStatusColor(step.status)}`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : step.status === "error" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : step.status === "processing" ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-2 ${step.status === "completed" ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    {getStatusBadge(step.status)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                  {/* Step Metrics */}
                  {step.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {Object.entries(step.metrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-2 rounded">
                          <div className="font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-gray-900">
                            {typeof value === "boolean"
                              ? value
                                ? "Yes"
                                : "No"
                              : typeof value === "number"
                                ? value.toLocaleString()
                                : typeof value === "object"
                                  ? JSON.stringify(value)
                                  : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Duration */}
                  {step.duration && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Completed in {step.duration}ms
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            System Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Mobile Frontend</h4>
              <p className="text-sm text-gray-600">Next.js 15, Camera API, Real-time UI</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold">Convex Backend</h4>
              <p className="text-sm text-gray-600">Real-time DB, Workflows, File Storage</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold">AI Processing</h4>
              <p className="text-sm text-gray-600">Damage Detection, Cost Estimation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mermaid Diagram */}
      {diagramCode && (
        <div className="w-full overflow-auto p-4 border rounded-lg bg-white dark:bg-gray-900">
          <div ref={mermaidRef} className="mermaid" />
        </div>
      )}
    </div>
  )
}
