"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideBarChart, LucideLineChart, Activity, Server, AlertTriangle, Info } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, LineChart } from "recharts"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock Data
const apiCallData = [
  { hour: "00:00", success: 120, error: 5 },
  { hour: "01:00", success: 110, error: 3 },
  { hour: "02:00", success: 90, error: 2 },
  { hour: "03:00", success: 130, error: 7 },
  { hour: "04:00", success: 150, error: 4 },
  { hour: "05:00", success: 140, error: 6 },
  { hour: "06:00", success: 160, error: 8 },
  { hour: "07:00", success: 180, error: 10 },
  { hour: "08:00", success: 200, error: 12 },
  { hour: "09:00", success: 220, error: 15 },
  { hour: "10:00", success: 250, error: 18 },
  { hour: "11:00", success: 230, error: 14 },
]

const modelLatencyData = [
  { hour: "00:00", latency: 1500 },
  { hour: "01:00", latency: 1450 },
  { hour: "02:00", latency: 1600 },
  { hour: "03:00", latency: 1550 },
  { hour: "04:00", latency: 1700 },
  { hour: "05:00", latency: 1650 },
  { hour: "06:00", latency: 1800 },
  { hour: "07:00", latency: 1750 },
  { hour: "08:00", latency: 1900 },
  { hour: "09:00", latency: 1850 },
  { hour: "10:00", latency: 2000 },
  { hour: "11:00", latency: 1950 },
]

const resourceUtilization = {
  cpu: 75,
  memory: 60,
  disk: 85,
}

const chartConfig = {
  success: {
    label: "Success",
    color: "hsl(var(--chart-1))",
  },
  error: {
    label: "Error",
    color: "hsl(var(--chart-2))",
  },
  latency: {
    label: "Latency (ms)",
    color: "hsl(var(--chart-3))",
  },
} as const

export function OllamaMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemHealth, setSystemHealth] = useState<"healthy" | "warning" | "critical">("healthy")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Randomly change health status for demo
      const rand = Math.random()
      if (rand < 0.1) {
        setSystemHealth("critical")
      } else if (rand < 0.3) {
        setSystemHealth("warning")
      } else {
        setSystemHealth("healthy")
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getHealthBadgeColor = () => {
    switch (systemHealth) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHealthMessage = () => {
    switch (systemHealth) {
      case "healthy":
        return "All systems operational."
      case "warning":
        return "Minor issues detected. Monitoring closely."
      case "critical":
        return "Critical issues detected. Immediate attention required!"
      default:
        return "Unknown status."
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ollama Monitoring Dashboard</h2>
      <p className="text-muted-foreground">
        Monitor the performance and health of your Ollama AI services and related APIs.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="api-metrics" className="flex items-center gap-2">
            <LucideBarChart className="h-4 w-4" /> API Metrics
          </TabsTrigger>
          <TabsTrigger value="resource-usage" className="flex items-center gap-2">
            <Server className="h-4 w-4" /> Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getHealthBadgeColor()}`} />
                <span className="font-semibold text-lg">{getHealthMessage()}</span>
              </div>
              {systemHealth === "warning" && (
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>High error rates detected in AI assessment API.</AlertDescription>
                </Alert>
              )}
              {systemHealth === "critical" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Critical Alert!</AlertTitle>
                  <AlertDescription>Ollama service is unresponsive. Check server status.</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <LucideBarChart className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Total API Calls (Last 24h)</div>
                        <div className="text-2xl font-bold">
                          {apiCallData.reduce((sum, d) => sum + d.success + d.error, 0)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <LucideLineChart className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Avg. Model Latency (Last 24h)</div>
                        <div className="text-2xl font-bold">
                          {(modelLatencyData.reduce((sum, d) => sum + d.latency, 0) / modelLatencyData.length).toFixed(
                            0,
                          )}{" "}
                          ms
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Call Volume & Errors</CardTitle>
              <CardDescription>Hourly breakdown of successful and error API calls.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <Bar data={apiCallData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="success" fill="var(--color-success)" radius={4} />
                    <Bar dataKey="error" fill="var(--color-error)" radius={4} />
                  </Bar>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Latency</CardTitle>
              <CardDescription>Average response time of AI models per hour.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={modelLatencyData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis dataKey="latency" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="latency" type="monotone" stroke="var(--color-latency)" strokeWidth={2} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resource-usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Server Resource Utilization</CardTitle>
              <CardDescription>Current CPU, Memory, and Disk usage of the Ollama server.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>CPU Usage</span>
                    <span>{resourceUtilization.cpu}%</span>
                  </div>
                  <Progress value={resourceUtilization.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Memory Usage</span>
                    <span>{resourceUtilization.memory}%</span>
                  </div>
                  <Progress value={resourceUtilization.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Disk Usage</span>
                    <span>{resourceUtilization.disk}%</span>
                  </div>
                  <Progress value={resourceUtilization.disk} className="h-2" />
                </div>
              </div>
              <Alert className="bg-blue-50 border-blue-200 text-blue-700">
                <Info className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  These metrics are simulated. In a production environment, integrate with actual server monitoring
                  tools.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
