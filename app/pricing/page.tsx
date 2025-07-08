"use client"

import { useState } from "react"
import { PricingDashboard } from "@/components/pricing-dashboard"
import { type ShopSettings, DEFAULT_SHOP_SETTINGS } from "@/lib/pricing-engine"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Settings, TrendingUp, Zap, CheckCircle, ArrowRight, DollarSign, Users, Target } from "lucide-react"

export default function PricingPage() {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS)
  const [activeTab, setActiveTab] = useState("overview")

  const handleSettingsChange = (newSettings: ShopSettings) => {
    setShopSettings(newSettings)
    // In a real app, you would save to database here
    console.log("Saving shop settings:", newSettings)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dynamic Pricing System</h1>
              <p className="text-gray-600 mt-2">
                AI-powered pricing with vehicle specs, damage assessment, and market factors
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Slick Solutions Pro
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dashboard">Pricing Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Smart Pricing
                  </CardTitle>
                  <CardDescription>AI-powered estimates based on vehicle specs and damage assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      VIN-based vehicle analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Damage severity scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Real-time market factors
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Dynamic Factors
                  </CardTitle>
                  <CardDescription>Pricing adapts to workload, weather, and seasonal demand</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Workload surge pricing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Weather adjustments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Seasonal demand factors
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Transparent Pricing
                  </CardTitle>
                  <CardDescription>Detailed breakdowns build customer trust and confidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Itemized cost breakdown
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Factor explanations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Membership savings
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">${shopSettings.laborRate}</div>
                      <div className="text-sm text-muted-foreground">Base Labor Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{Object.keys(shopSettings.membershipDiscounts).length}</div>
                      <div className="text-sm text-muted-foreground">Membership Tiers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">{Math.round(shopSettings.workloadThreshold * 100)}%</div>
                      <div className="text-sm text-muted-foreground">Surge Threshold</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Settings className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">{Object.keys(shopSettings.servicePackages).length}</div>
                      <div className="text-sm text-muted-foreground">Service Packages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started with Dynamic Pricing</CardTitle>
                <CardDescription>Follow these steps to optimize your pricing strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Configure Base Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Set your labor rates, location factors, and service packages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Set Pricing Factors</h4>
                      <p className="text-sm text-muted-foreground">
                        Adjust multipliers for vehicle condition, damage, and market factors
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Monitor & Optimize</h4>
                      <p className="text-sm text-muted-foreground">
                        Track performance and adjust settings based on results
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setActiveTab("dashboard")}>
                    Open Pricing Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline">View Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <PricingDashboard initialSettings={shopSettings} onSettingsChange={handleSettingsChange} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Analytics</CardTitle>
                <CardDescription>Monitor pricing performance and optimization opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p>Detailed pricing analytics and performance metrics will be available here.</p>
                  <p className="text-sm mt-2">Track estimate accuracy, conversion rates, and revenue optimization.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
