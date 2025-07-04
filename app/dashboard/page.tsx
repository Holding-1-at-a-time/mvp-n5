"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, Clock, Users, TrendingUp, Eye, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  date: string
  time: string
  customer: string
  status: "pending" | "confirmed" | "in-progress" | "completed"
  total: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("inspections")

  const upcomingJobs: Job[] = [
    {
      id: "1",
      date: "7/6",
      time: "1:00 PM",
      customer: "John Doe",
      status: "pending",
      total: 167.4,
    },
    {
      id: "2",
      date: "7/7",
      time: "9:00 AM",
      customer: "Jane Smith",
      status: "confirmed",
      total: 245.8,
    },
    {
      id: "3",
      date: "7/7",
      time: "2:00 PM",
      customer: "Mike Johnson",
      status: "confirmed",
      total: 89.5,
    },
    {
      id: "4",
      date: "7/8",
      time: "11:00 AM",
      customer: "Sarah Wilson",
      status: "pending",
      total: 312.75,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-3 w-3" />
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />
      case "in-progress":
        return <Clock className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const stats = {
    pendingInspections: 5,
    monthlyRevenue: 4200,
    avgTurnaround: 2.5,
    totalCustomers: 28,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Shop Dashboard</h1>
          </div>
          <Link href="/upload">
            <Button>New Inspection</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingInspections}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Eye className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                  <p className="text-2xl font-bold">{stats.avgTurnaround}h</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{job.date}</p>
                          <p className="text-xs text-gray-600">{job.time}</p>
                        </div>
                        <div>
                          <p className="font-medium">{job.customer}</p>
                          <p className="text-sm text-gray-600">${job.total.toFixed(2)}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          {job.status}
                        </div>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs
                    .filter((job) => job.status !== "completed")
                    .map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {job.date} • {job.time}
                            </p>
                            <p className="text-sm text-gray-600">{job.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">${job.total.toFixed(2)}</span>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{job.customer}</p>
                          <p className="text-sm text-gray-600">
                            {job.date} • {job.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${job.total.toFixed(2)}</p>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-bold text-green-600">+15.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Month</span>
                      <span className="font-medium">$3,650</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Job Value</span>
                      <span className="font-medium">$178.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="font-bold text-green-600">4.8/5.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Repeat Customers</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On-Time Completion</span>
                      <span className="font-medium">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
