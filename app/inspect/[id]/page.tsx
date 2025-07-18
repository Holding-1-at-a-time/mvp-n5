"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Camera, Brain, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

interface InspectionStatusPageProps {
  params: {
    id: string
  }
}

export default function InspectionStatusPage({ params }: InspectionStatusPageProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  const inspection = useQuery(api.inspections.get, {
    id: params.id as Id<"inspections">,
  })

  // Simulate progress updates
  useEffect(() => {
    if (!inspection) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (inspection.status === "complete") return 100
        if (inspection.status === "processing") return Math.min(prev + 2, 90)
        if (inspection.status === "pending") return Math.min(prev + 1, 30)
        return prev
      })
    }, 500)

    return () => clearInterval(interval)
  }, [inspection]) // Updated dependency array

  // Navigate to results when complete
  useEffect(() => {
    if (inspection?.status === "complete") {
      const timer = setTimeout(() => {
        router.push(`/assessment?inspectionId=${params.id}`)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [inspection?.status, params.id, router])

  if (!inspection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const getStatusInfo = () => {
    switch (inspection.status) {
      case "pending":
        return {
          icon: Clock,
          title: "Processing Images",
          description: "Uploading and preparing your vehicle photos...",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        }
      case "processing":
        return {
          icon: Brain,
          title: "AI Analysis in Progress",
          description: "Our AI is analyzing damage and generating estimates...",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        }
      case "complete":
        return {
          icon: CheckCircle,
          title: "Analysis Complete",
          description: "Redirecting to your inspection results...",
          color: "text-green-600",
          bgColor: "bg-green-50",
        }
      case "failed":
        return {
          icon: AlertCircle,
          title: "Analysis Failed",
          description: "Something went wrong. Please try again.",
          color: "text-red-600",
          bgColor: "bg-red-50",
        }
      default:
        return {
          icon: Clock,
          title: "Processing",
          description: "Please wait...",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Inspection</h1>
          <Badge variant="outline" className="text-sm">
            VIN: {inspection.vinNumber}
          </Badge>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-4">
            <div
              className={`w-16 h-16 mx-auto rounded-full ${statusInfo.bgColor} flex items-center justify-center mb-4`}
            >
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
            <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
            <p className="text-gray-600 text-sm">{statusInfo.description}</p>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Processing Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      progress >= 30 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                  </div>
                  <span className={`text-sm ${progress >= 30 ? "text-green-600" : "text-gray-500"}`}>
                    Images uploaded
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      progress >= 60 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Brain className="w-3 h-3" />
                  </div>
                  <span className={`text-sm ${progress >= 60 ? "text-green-600" : "text-gray-500"}`}>
                    AI damage detection
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      progress >= 100 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className={`text-sm ${progress >= 100 ? "text-green-600" : "text-gray-500"}`}>
                    Report generation
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">This usually takes 2-3 minutes depending on the number of images.</p>
              <p>You'll be automatically redirected when the analysis is complete.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
