"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, Car, ClipboardCheck, Building2, Plus } from "lucide-react"
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
        <div className="w-8 h-8 border-4 border-[#00ae98] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect w-96">
          <CardHeader className="text-center">
            <Logo className="justify-center mb-4" />
            <CardTitle className="text-white">Welcome to Slick Solutions</CardTitle>
            <CardDescription className="text-slate-400">Create your first shop to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-[#00ae98] to-[#00ae98]/80 hover:from-[#00ae98]/90 hover:to-[#00ae98]/70 shadow-lg shadow-[#00ae98]/25">
              <Plus className="h-4 w-4 mr-2" />
              Create Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">
                  {currentShop?.name} • {currentShop?.userRole} access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedShopId || currentShop?._id || ""}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus-ring"
              >
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              <StatusBadge
                status={currentShop?.subscription.status || "inactive"}
                className="bg-[#00ae98]/20 text-[#00ae98] border border-[#00ae98]/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Inspections</p>
                  <p className="text-3xl font-bold text-white">{inspectionStats?.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <StatusBadge status="completed" type="inspection" />
                <span className="text-xs text-slate-400">{inspectionStats?.completed || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Active Customers</p>
                  <p className="text-3xl font-bold text-white">{customers?.page.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Vehicles Managed</p>
                  <p className="text-3xl font-bold text-white">{vehicles?.page.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <Car className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Team Members</p>
                  <p className="text-3xl font-bold text-white">{users?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="inspections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-600">
            <TabsTrigger
              value="inspections"
              className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white"
            >
              Inspections
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white">
              Customers
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white">
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="shops" className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white">
              Shops
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white">
              Settings
            </TabsTrigger>
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
