"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertTriangle, CheckCircle, Database, Eye, RefreshCw, Server, TrendingUp, Zap } from "lucide-react"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  service: string
  version: string
  models: {
    vision: string
    embedding: string
  }
  ollama: {
    url: string
    healthy: boolean
  }
  timestamp: string
}

interface MetricData {
  name: string
  value: number
  unit: string
  status: "good" | "warning" | "critical"
  trend: "up" | "down" | "stable"
}

export function OllamaMonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/v1/assess", {
        method: "GET",
      })

      const data = await response.json()
      setHealthStatus(data)
      setLastUpdate(new Date())

      // Generate mock metrics for demonstration
      const mockMetrics: MetricData[] = [
        {
          name: "Vision Model Latency",
          value: Math.random() * 2000 + 500,
          unit: "ms",
          status: Math.random() > 0.7 ? "warning" : "good",
          trend: Math.random() > 0.5 ? "up" : "down",
        },
        {
          name: "Embedding Latency",
          value: Math.random() * 1000 + 200,
          unit: "ms",
          status: Math.random() > 0.8 ? "critical" : "good",
          trend: "stable",
        },
        {
          name: "Assessment Confidence",
          value: Math.random() * 0.3 + 0.7,
          unit: "%",
          status: "good",
          trend: "up",
        },
        {
          name: "Success Rate",
          value: Math.random() * 0.1 + 0.9,
          unit: "%",
          status: "good",
          trend: "stable",
        },
        {
          name: "Queue Depth",
          value: Math.floor(Math.random() * 10),
          unit: "requests",
          status: Math.random() > 0.6 ? "warning" : "good",
          trend: "down",
        },
        {
          name: "Memory Usage",
          value: Math.random() * 0.4 + 0.4,
          unit: "%",
          status: Math.random() > 0.7 ? "warning" : "good",
          trend: "up",
        },
      ]

      setMetrics(mockMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health status")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "good":
        return "text-green-600 bg-green-100"
      case "degraded":
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "unhealthy":
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "good":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "unhealthy":
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case "down":
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
      default:
        return <Activity className="h-3 w-3 text-gray-600" />
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") {
      return `${Math.round(value * 100)}%`
    }
    if (unit === "ms") {
      return `${Math.round(value)}ms`
    }
    return `${Math.round(value)} ${unit}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ollama Monitoring Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring of AI vision and embedding services</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={fetchHealthStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Service Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Status</span>
                  <Badge className={getStatusColor(healthStatus.status)}>
                    {getStatusIcon(healthStatus.status)}
                    <span className="ml-1 capitalize">{healthStatus.status}</span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service Version</span>
                  <Badge variant="outline">{healthStatus.version}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ollama Connection</span>
                  <Badge className={getStatusColor(healthStatus.ollama.healthy ? "good" : "critical")}>
                    {getStatusIcon(healthStatus.ollama.healthy ? "good" : "critical")}
                    <span className="ml-1">{healthStatus.ollama.healthy ? "Connected" : "Disconnected"}</span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vision Model
                  </span>
                  <Badge variant="outline">{healthStatus.models.vision}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Embedding Model
                  </span>
                  <Badge variant="outline">{healthStatus.models.embedding}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ollama URL</span>
                  <span className="text-sm font-mono text-muted-foreground">{healthStatus.ollama.url}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>Key performance indicators for AI processing pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <Badge variant="outline" className={`text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>

                <div className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</div>

                {metric.unit === "%" && <Progress value={metric.value * 100} className="h-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Parallel Requests:</span>
                  <span className="font-mono">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Loaded Models:</span>
                  <span className="font-mono">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flash Attention:</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Timeout:</span>
                  <span className="font-mono">30s</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Alert Thresholds</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vision Latency:</span>
                  <span className="font-mono">&gt; 2000ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Embedding Latency:</span>
                  <span className="font-mono">&gt; 1000ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Confidence:</span>
                  <span className="font-mono">&lt; 60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failure Rate:</span>
                  <span className="font-mono">&gt; 5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Updating metrics...</span>
          </div>
        </div>
      )}
    </div>
  )
}
