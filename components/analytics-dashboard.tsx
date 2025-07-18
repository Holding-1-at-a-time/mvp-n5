"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarList, Line, XAxis, YAxis, CartesianGrid, Pie, Cell } from "recharts"

// Mock Data
const monthlyRevenueData = [
  { month: "Jan", revenue: 3500 },
  { month: "Feb", revenue: 4200 },
  { month: "Mar", revenue: 3800 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 5100 },
  { month: "Jun", revenue: 4800 },
]

const jobStatusData = [
  { name: "Completed", value: 120, fill: "var(--color-completed)" },
  { name: "In Progress", value: 30, fill: "var(--color-in-progress)" },
  { name: "Pending", value: 15, fill: "var(--color-pending)" },
  { name: "Cancelled", value: 5, fill: "var(--color-cancelled)" },
]

const serviceCategoryData = [
  { name: "Body Work", value: 45000 },
  { name: "Paint Work", value: 30000 },
  { name: "Dent Repair", value: 25000 },
  { name: "Detailing", value: 15000 },
  { name: "Other", value: 5000 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  "in-progress": {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(var(--chart-4))",
  },
  "body-work": {
    label: "Body Work",
    color: "hsl(var(--chart-1))",
  },
  "paint-work": {
    label: "Paint Work",
    color: "hsl(var(--chart-2))",
  },
  "dent-repair": {
    label: "Dent Repair",
    color: "hsl(var(--chart-3))",
  },
  detailing: {
    label: "Detailing",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} as const

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Shop Analytics</h2>
      <p className="text-muted-foreground">Gain insights into your shop's performance and operations.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <LineChart
                    accessibilityLayer
                    data={monthlyRevenueData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis dataKey="revenue" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Job Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={jobStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={80}
                      strokeWidth={2}
                      cornerRadius={5}
                      paddingAngle={5}
                    >
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Revenue by Service Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <BarList data={serviceCategoryData} dataKey="name" valueKey="value" />
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Revenue Trends</CardTitle>
              {/* <CardDescription>Monthly revenue performance over time.</CardDescription> */}
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart
                  accessibilityLayer
                  data={monthlyRevenueData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis dataKey="revenue" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={true} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Status Breakdown</CardTitle>
              {/* <CardDescription>Current distribution of job statuses.</CardDescription> */}
            </CardHeader>
            <CardContent className="flex aspect-square items-center justify-center p-6">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={jobStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={80}
                    outerRadius={120}
                    strokeWidth={2}
                    cornerRadius={5}
                    paddingAngle={5}
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
