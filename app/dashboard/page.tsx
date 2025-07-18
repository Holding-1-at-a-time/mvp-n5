"use client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useErrorHandler } from "@/lib/error-handling"
import { toast } from "sonner"
import { useState } from "react"

// Force dynamic rendering to prevent build-time errors
export const dynamic = "force-dynamic"

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
    setRetryCount(prev => prev + 1)
    toast.info('Refreshing dashboard data...')
  }

  // Handle loading state
  if (stats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              \
