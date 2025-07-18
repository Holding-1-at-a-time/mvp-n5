"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, Clock, DollarSign, TrendingUp, AlertTriangle, RefreshCw, Activity, Users, CheckCircle, XCircle } from 'lucide-react'
import { ErrorBoundary, APIErrorBoundary } from "@/components/error-boundary"
import { useErrorHandler } from "@/lib/error-handling"
import { toast } from "sonner"
import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time errors
// export const dynamic = "force-dynamic"

interface DashboardStats {
  totalInspections: number
  pendingInspections: number
  completedInspections: number
  recentInspections: number
  revenue: number
  averageProcessingTime: number
  aiAccuracy: number
  customerSatisfaction: number
}

interface RecentActivity {
  _id: string
  vinNumber: string
  status: string
  scheduledDate: number
  vehicle: {
    make: string
    model: string
    year: number
  }
  customer: {
    name: string
    email: string
  }
}

interface SystemHealth {
  overall: string
  database: string
  aiProcessing: string
  fileStorage: string
  lastChecked: number
  uptime: number
  errorRate: number
  error?: string
}

function DashboardStats({ shopId }: { shopId: string }) {
  const { handleError } = useErrorHandler()
  const [retryCount, setRetryCount] = useState(0)

  const stats = useQuery(api.components.getDashboardStats, { shopId })

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    toast.info("Refreshing dashboard data...")
  }

  // Handle loading state
  if (stats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Handle error state
  if (stats === null) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load dashboard statistics. Please try again.</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const statCards = [
    {
      title: "Total Inspections",
      value: stats.totalInspections?.toString() || "0",
      description: "All time inspections",
      icon: Car,
      trend: "+12% from last month",
    },
    {
      title: "Pending",
      value: stats.pendingInspections?.toString() || "0",
      description: "Awaiting inspection",
      icon: Clock,
      trend: `${stats.pendingInspections > 10 ? "High" : "Normal"} workload`,
    },
    {
      title: "Revenue",
      value: `$${(stats.revenue || 0).toLocaleString()}`,
      description: "Last 30 days",
      icon: DollarSign,
      trend: "+8% from last month",
    },
    {
      title: "Completion Rate",
      value: `${Math.round(((stats.completedInspections || 0) / Math.max(stats.totalInspections || 1, 1)) * 100)}%`,
      description: "Success rate",
      icon: TrendingUp,
      trend: "Above average",
    },
    {
      title: "Avg Processing Time",
      value: `${stats.averageProcessingTime || 0}min`,
      description: "Per inspection",
      icon: Activity,
      trend: stats.averageProcessingTime < 60 ? "Efficient" : "Needs improvement",
    },
    {
      title: "AI Accuracy",
      value: `${Math.round((stats.aiAccuracy || 0) * 100)}%`,
      description: "Damage detection",
      icon: CheckCircle,
      trend: stats.aiAccuracy > 0.85 ? "Excellent" : "Good",
    },
    {
      title: "Customer Satisfaction",
      value: `${stats.customerSatisfaction || 0}/5`,
      description: "Average rating",
      icon: Users,
      trend: stats.customerSatisfaction > 4.0 ? "Excellent" : "Good",
    },
    {
      title: "Recent Activity",
      value: stats.recentInspections?.toString() || "0",
      description: "Last 30 days",
      icon: Activity,
      trend: "Active period",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentActivityList({ shopId }: { shopId: string }) {
  const { handleError } = useErrorHandler()
  const [retryCount, setRetryCount] = useState(0)

  const activities = useQuery(api.components.getRecentActivity, {
    shopId,
    limit: 10,
  })

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    toast.info("Refreshing recent activity...")
  }

  if (activities === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest inspections and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest inspections and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity found</p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-4 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest inspections and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity: RecentActivity) => (
            <div key={activity._id} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.vehicle?.year} {activity.vehicle?.make} {activity.vehicle?.model}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.customer?.name} • VIN: {activity.vinNumber?.slice(-6)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.scheduledDate ? new Date(activity.scheduledDate).toLocaleDateString() : "No date"}
                </p>
              </div>
              <Badge className={getStatusColor(activity.status)}>
                {activity.status?.replace("_", " ") || "unknown"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SystemHealthCard({ shopId }: { shopId: string }) {
  const { handleError } = useErrorHandler()
  const [retryCount, setRetryCount] = useState(0)

  const health = useQuery(api.components.getSystemHealth, { shopId })

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    toast.info("Checking system health...")
  }

  if (health === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Service status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Service status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Unable to check system health</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const services = [
    { name: "Database", status: health.database },
    { name: "AI Processing", status: health.aiProcessing },
    { name: "File Storage", status: health.fileStorage },
    { name: "Overall", status: health.overall },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Service status and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getHealthIcon(service.status)}
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <Badge className={getHealthColor(service.status)}>{service.status}</Badge>
            </div>
          ))}

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uptime</span>
              <span>{Math.round((health.uptime || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Error Rate</span>
              <span>{Math.round((health.errorRate || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Last Checked</span>
              <span>{health.lastChecked ? new Date(health.lastChecked).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>

          {health.error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{health.error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { handleError } = useErrorHandler()

  // Mock shop ID - in real app this would come from user context
  const shopId = "shop_123"

  useEffect(() => {
    // Set up global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason), {
        context: "unhandledRejection",
        page: "dashboard",
      })
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection)
  }, [handleError])

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please sign in to view your dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}. Here's what's happening with your
              shop.
            </p>
          </div>

          {/* Stats Grid */}
          <APIErrorBoundary>
            <DashboardStats shopId={shopId} />
          </APIErrorBoundary>

          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <APIErrorBoundary>
              <RecentActivityList shopId={shopId} />
            </APIErrorBoundary>

            <APIErrorBoundary>
              <SystemHealthCard shopId={shopId} />
            </APIErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
