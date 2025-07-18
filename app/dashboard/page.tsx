"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DollarSign, Clock, TrendingUp, Camera, CheckCircle, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  date: string
  time: string
  customer: string
  status: "pending" | "confirmed" | "in-progress" | "completed"
  services: string[]
  total: number
  avatar?: string
}

const upcomingJobs: Job[] = [
  {
    id: "1",
    date: "Jan 7",
    time: "1:00 PM",
    customer: "John Doe",
    status: "confirmed",
    services: ["Scratch Repair", "Dent Removal"],
    total: 886.4,
  },
  {
    id: "2",
    date: "Jan 7",
    time: "9:00 AM",
    customer: "Jane Smith",
    status: "pending",
    services: ["Paint Touch-up", "Interior Clean"],
    total: 450.0,
  },
  {
    id: "3",
    date: "Jan 8",
    time: "11:00 AM",
    customer: "Mike Johnson",
    status: "confirmed",
    services: ["Bumper Repair"],
    total: 320.0,
  },
  {
    id: "4",
    date: "Jan 8",
    time: "2:00 PM",
    customer: "Sarah Wilson",
    status: "in-progress",
    services: ["Full Detail", "Headlight Restoration"],
    total: 280.0,
  },
]

const stats = {
  pendingInspections: 5,
  monthlyRevenue: 4200,
  avgTurnaround: 2.5,
  completedJobs: 23,
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("inspections")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shop Dashboard</h1>
            <p className="text-gray-600">Slick Solutions Auto Care</p>
          </div>
          <Link href="/inspect/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Inspections</p>
                  <p className="text-3xl font-bold">{stats.pendingInspections}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
                  <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Turnaround</p>
                  <p className="text-3xl font-bold">{stats.avgTurnaround}h</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                  <p className="text-3xl font-bold">{stats.completedJobs}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {job.customer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{job.customer}</div>
                          <div className="text-sm text-gray-600">{job.services.join(", ")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">${job.total}</div>
                          <div className="text-sm text-gray-600">
                            {job.date} • {job.time}
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1 capitalize">{job.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="font-bold text-lg">{job.date.split(" ")[1]}</div>
                          <div className="text-sm text-gray-600">{job.date.split(" ")[0]}</div>
                        </div>
                        <div className="w-px h-12 bg-gray-200"></div>
                        <div>
                          <div className="font-medium">{job.time}</div>
                          <div className="text-sm text-gray-600">{job.customer}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{job.services.join(", ")}</div>
                          <div className="font-semibold">${job.total}</div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          <span className="capitalize">{job.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs
                    .filter((job) => job.status === "completed" || job.status === "confirmed")
                    .map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {job.customer
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{job.customer}</div>
                            <div className="text-sm text-gray-600">Invoice #{job.id.padStart(5, "0")}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">${job.total}</div>
                            <div className="text-sm text-gray-600">{job.date}</div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Paid
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Jobs Completed</span>
                      <span className="font-semibold">{stats.completedJobs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-semibold">${stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Job Value</span>
                      <span className="font-semibold">${Math.round(stats.monthlyRevenue / stats.completedJobs)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="font-semibold">4.8/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Scratch Repair</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dent Removal</span>
                      <span className="font-semibold">28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paint Work</span>
                      <span className="font-semibold">22%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Detailing</span>
                      <span className="font-semibold">15%</span>
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
