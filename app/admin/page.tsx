"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Car, ClipboardCheck, Building2, CheckCircle, Clock, Plus } from "lucide-react"
import { ShopManagement } from "@/components/admin/shop-management"
import { UserManagement } from "@/components/admin/user-management"
import { CustomerManagement } from "@/components/admin/customer-management"
import { VehicleManagement } from "@/components/admin/vehicle-management"
import { InspectionManagement } from "@/components/admin/inspection-management"
import { SystemSettings } from "@/components/admin/system-settings"

export default function AdminDashboard() {
  const [selectedShopId, setSelectedShopId] = useState<string>("")

  // Get user's shops
  const shops = useQuery(api.shops.list)
  const currentShop = shops?.find((shop) => shop._id === selectedShopId) || shops?.[0]

  // Get dashboard stats for current shop
  const inspectionStats = useQuery(api.inspections.getStats, currentShop ? { shopId: currentShop._id } : "skip")

  const customers = useQuery(api.customers.list, currentShop ? { shopId: currentShop._id, limit: 5 } : "skip")

  const vehicles = useQuery(api.vehicles.list, currentShop ? { shopId: currentShop._id, limit: 5 } : "skip")

  const users = useQuery(api.users.list, currentShop ? { shopId: currentShop._id } : "skip")

  if (!shops) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Welcome to Slick Solutions</CardTitle>
            <CardDescription>Create your first shop to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">
              {currentShop?.name} • {currentShop?.userRole} access
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedShopId || currentShop?._id || ""}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </select>
            <Badge variant={currentShop?.subscription.status === "active" ? "default" : "destructive"}>
              {currentShop?.subscription.plan}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                  <p className="text-3xl font-bold">{inspectionStats?.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {inspectionStats?.completed || 0} completed
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {inspectionStats?.inProgress || 0} in progress
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-3xl font-bold">{customers?.page.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vehicles Managed</p>
                  <p className="text-3xl font-bold">{vehicles?.page.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-3xl font-bold">{users?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="inspections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections">
            {currentShop && <InspectionManagement shopId={currentShop._id} />}
          </TabsContent>

          <TabsContent value="customers">{currentShop && <CustomerManagement shopId={currentShop._id} />}</TabsContent>

          <TabsContent value="vehicles">{currentShop && <VehicleManagement shopId={currentShop._id} />}</TabsContent>

          <TabsContent value="users">{currentShop && <UserManagement shopId={currentShop._id} />}</TabsContent>

          <TabsContent value="shops">
            <ShopManagement />
          </TabsContent>

          <TabsContent value="settings">{currentShop && <SystemSettings shopId={currentShop._id} />}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
