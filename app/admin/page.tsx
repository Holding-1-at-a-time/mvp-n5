"use client"

import type React from "react"

import { useState } from "react"

/* ---------------------------------------------------------------------
 * IMPORTANT: When Convex is running, comment the next line and re-enable
 * the original `api` + `useQuery` imports to use live data.
 * ------------------------------------------------------------------- */
import { dashboards, shops as demoShops } from "@/lib/demo-data"

// import { useQuery } from "convex/react"           // ← enable later
// import { api } from "@/convex/_generated/api"     // ← enable later

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  /* ------------------ MOCK DATA  ------------------ */
  const shops = demoShops
  const currentShop = shops.find((shop) => shop._id === selectedShopId) ?? shops[0]

  const inspectionStats = dashboards.inspections
  const customersCount = dashboards.customers
  const vehiclesCount = dashboards.vehicles
  const usersCount = dashboards.users
  /* ------------------------------------------------ */

  // ---------- Loading / empty states for preview only ----------
  if (!shops || shops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect w-96">
          <CardHeader className="text-center space-y-2">
            <Logo className="justify-center" size="sm" />
            <CardTitle className="text-white">Welcome to Slick Solutions</CardTitle>
            <p className="text-slate-400 text-sm">Create your first shop to get started</p>
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
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400">
                {currentShop.name} • {currentShop.userRole} access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedShopId || currentShop._id}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00ae98] focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </select>
            <StatusBadge status={currentShop.subscription.status} type="subscription" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Total Inspections"
            value={inspectionStats.total}
            icon={<ClipboardCheck className="h-6 w-6 text-blue-400" />}
            gradient="from-blue-500/20 to-blue-500/10"
          />
          <OverviewCard
            title="Active Customers"
            value={customersCount}
            icon={<Users className="h-6 w-6 text-green-400" />}
            gradient="from-green-500/20 to-green-500/10"
          />
          <OverviewCard
            title="Vehicles Managed"
            value={vehiclesCount}
            icon={<Car className="h-6 w-6 text-purple-400" />}
            gradient="from-purple-500/20 to-purple-500/10"
          />
          <OverviewCard
            title="Team Members"
            value={usersCount}
            icon={<Building2 className="h-6 w-6 text-orange-400" />}
            gradient="from-orange-500/20 to-orange-500/10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inspections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-600">
            {["inspections", "customers", "vehicles", "users", "shops", "settings"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-[#00ae98] data-[state=active]:text-white capitalize"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="inspections">
            {/* Stubbed component for preview */}
            <InspectionManagement shopId={currentShop._id} />
          </TabsContent>
          <TabsContent value="customers">
            <CustomerManagement shopId={currentShop._id} />
          </TabsContent>
          <TabsContent value="vehicles">
            <VehicleManagement shopId={currentShop._id} />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement shopId={currentShop._id} />
          </TabsContent>
          <TabsContent value="shops">
            <ShopManagement />
          </TabsContent>
          <TabsContent value="settings">
            <SystemSettings shopId={currentShop._id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

/* ---------- Small presentational helper ---------- */
interface OverviewCardProps {
  title: string
  value: number
  icon: React.ReactNode
  gradient: string
}

function OverviewCard({ title, value, icon, gradient }: OverviewCardProps) {
  return (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
