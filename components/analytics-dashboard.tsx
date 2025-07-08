"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Car, MapPin, Calendar, DollarSign } from "lucide-react"

// Mock analytics data based on VIN-decoded vehicle specs
const mockAnalyticsData = {
  vehiclesByMake: [
    { make: "Toyota", count: 45, revenue: 6750 },
    { make: "Honda", count: 38, revenue: 5700 },
    { make: "Ford", count: 32, revenue: 5280 },
    { make: "Chevrolet", count: 28, revenue: 4620 },
    { make: "Nissan", count: 22, revenue: 3630 },
  ],
  vehiclesByBodyClass: [
    { bodyClass: "Sedan", count: 65, avgPrice: 125 },
    { bodyClass: "SUV", count: 48, avgPrice: 165 },
    { bodyClass: "Truck", count: 35, avgPrice: 185 },
    { bodyClass: "Coupe", count: 12, avgPrice: 145 },
    { bodyClass: "Wagon", count: 8, avgPrice: 135 },
  ],
  fuelTypeDistribution: [
    { fuelType: "Gasoline", count: 142, percentage: 84.5 },
    { fuelType: "Hybrid", count: 18, percentage: 10.7 },
    { fuelType: "Electric", count: 6, percentage: 3.6 },
    { fuelType: "Diesel", count: 2, percentage: 1.2 },
  ],
  plantLocationAnalysis: [
    { location: "USA", count: 128, avgAge: 8.2 },
    { location: "Japan", count: 24, avgAge: 6.1 },
    { location: "Germany", count: 12, avgAge: 7.8 },
    { location: "South Korea", count: 8, avgAge: 5.9 },
  ],
  monthlyTrends: [
    { month: "Jan", services: 45, revenue: 6750 },
    { month: "Feb", services: 52, revenue: 7800 },
    { month: "Mar", services: 68, revenue: 10200 },
    { month: "Apr", services: 71, revenue: 10650 },
    { month: "May", services: 83, revenue: 12450 },
    { month: "Jun", services: 95, revenue: 14250 },
  ],
  ageDistribution: [
    { ageRange: "0-2 years", count: 28, avgSpend: 145 },
    { ageRange: "3-5 years", count: 42, avgSpend: 135 },
    { ageRange: "6-10 years", count: 58, avgSpend: 125 },
    { ageRange: "11-15 years", count: 35, avgSpend: 155 },
    { ageRange: "15+ years", count: 18, avgSpend: 175 },
  ],
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function AnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months")

  const totalServices = mockAnalyticsData.vehiclesByMake.reduce((sum, item) => sum + item.count, 0)
  const totalRevenue = mockAnalyticsData.vehiclesByMake.reduce((sum, item) => sum + item.revenue, 0)
  const avgTicket = totalRevenue / totalServices

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Vehicle Analytics Dashboard</h2>
        <p className="text-muted-foreground">Insights based on VIN-decoded vehicle specifications</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Services</div>
                <div className="text-2xl font-bold">{totalServices}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm text-muted-foreground">Avg Ticket</div>
                <div className="text-2xl font-bold">${avgTicket.toFixed(0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-2xl font-bold">+18%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicle Analysis</TabsTrigger>
          <TabsTrigger value="geography">Geographic</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        {/* Vehicle Analysis */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services by Make */}
            <Card>
              <CardHeader>
                <CardTitle>Services by Vehicle Make</CardTitle>
                <CardDescription>Based on VIN-decoded manufacturer data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalyticsData.vehiclesByMake}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="make" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Body Class Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Body Class Distribution</CardTitle>
                <CardDescription>Service volume by body class from VIN data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.vehiclesByBodyClass.map((item, index) => (
                    <div key={item.bodyClass} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.bodyClass}</span>
                        <span>
                          {item.count} services (${item.avgPrice} avg)
                        </span>
                      </div>
                      <Progress value={(item.count / totalServices) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fuel Type Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Type Distribution</CardTitle>
              <CardDescription>Service breakdown by fuel type (VIN: FuelTypePrimary)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.fuelTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ fuelType, percentage }) => `${fuelType} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockAnalyticsData.fuelTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {mockAnalyticsData.fuelTypeDistribution.map((item, index) => (
                    <div key={item.fuelType} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="font-medium">{item.fuelType}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.count} vehicles ({item.percentage}%)
                        </div>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Analysis */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Manufacturing Plant Analysis
              </CardTitle>
              <CardDescription>
                Service patterns by vehicle manufacturing location (VIN: PlantCity/PlantCountry)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Services by Plant Location</h4>
                  {mockAnalyticsData.plantLocationAnalysis.map((item) => (
                    <div key={item.location} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.location}</span>
                        <span>
                          {item.count} vehicles (avg {item.avgAge}y old)
                        </span>
                      </div>
                      <Progress value={(item.count / totalServices) * 100} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Regional Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">USA Vehicles</div>
                      <div className="text-sm text-blue-700">
                        Highest volume, older average age suggests more maintenance needs
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900">Japanese Vehicles</div>
                      <div className="text-sm text-green-700">
                        Newer average age, premium service packages preferred
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-medium text-orange-900">European Vehicles</div>
                      <div className="text-sm text-orange-700">Specialty services required, higher average ticket</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Analysis */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Service Trends</CardTitle>
              <CardDescription>Service volume and revenue trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalyticsData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="services" fill="#0088FE" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Analysis */}
        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Age Segmentation</CardTitle>
              <CardDescription>Service patterns by vehicle age (derived from VIN ModelYear)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalyticsData.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageRange" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884D8" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <h4 className="font-semibold">Age-Based Insights</h4>
                  {mockAnalyticsData.ageDistribution.map((item, index) => (
                    <div key={item.ageRange} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.ageRange}</span>
                        <Badge variant="outline">{item.count} vehicles</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Average spend: ${item.avgSpend}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.ageRange.includes("15+")
                          ? "Restoration services popular"
                          : item.ageRange.includes("0-2")
                            ? "Paint protection preferred"
                            : "Standard detailing packages"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
