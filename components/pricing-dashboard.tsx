"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  DollarSign,
  TrendingUp,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Target,
} from "lucide-react"
import {
  type ShopSettings,
  DEFAULT_SHOP_SETTINGS,
  type PricingParams,
  type DamageMetrics,
  buildPricingParams,
} from "@/lib/pricing-engine"
import type { SlickVehicleSpecs } from "@/lib/vin-decoder"
import { PricingBreakdownComponent } from "./pricing-breakdown"

interface PricingDashboardProps {
  initialSettings?: ShopSettings
  onSettingsChange?: (settings: ShopSettings) => void
}

export function PricingDashboard({ initialSettings, onSettingsChange }: PricingDashboardProps) {
  const [settings, setSettings] = useState<ShopSettings>(initialSettings || DEFAULT_SHOP_SETTINGS)
  const [previewParams, setPreviewParams] = useState<PricingParams | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Sample data for preview
  const sampleVehicle: SlickVehicleSpecs = {
    year: 2020,
    make: "Toyota",
    model: "Camry",
    trim: "LE",
    bodyClass: "Sedan",
    vehicleType: "Passenger Car",
    doors: 4,
    cylinders: 4,
    displacement: 2.5,
    fuelType: "Gasoline",
    driveType: "FWD",
    plantCity: "Georgetown",
    plantCountry: "USA",
    gvwr: 4400,
    ageFactor: 0.05,
    sizeFactor: 0.1,
    complexityFactor: 0.05,
    specialtyFactor: 0.0,
  }

  const sampleDamages: DamageMetrics = {
    count: 2,
    averageSeverity: 0.6,
    totalArea: 0.5,
    types: ["scratch", "dent"],
    locations: ["front_bumper", "driver_door"],
  }

  const sampleCustomer = {
    membershipTier: "Silver",
    loyaltyPoints: 250,
    historicalSpend: 500,
    preferredServices: ["premium_detail"],
  }

  const sampleMarket = {
    weatherFactor: 1.0,
    seasonalDemand: 1.15,
    competitorIndex: 0.02,
    localDemand: 1.1,
  }

  // Update preview when settings change
  useEffect(() => {
    const servicePackage = settings.servicePackages.premium_detail
    if (servicePackage) {
      const params = buildPricingParams(
        sampleVehicle,
        sampleDamages,
        servicePackage,
        settings,
        sampleCustomer,
        sampleMarket,
        1,
        "moderate",
      )
      setPreviewParams(params)
    }
  }, [settings])

  const updateSettings = (updates: Partial<ShopSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    setHasUnsavedChanges(true)
  }

  const saveSettings = () => {
    onSettingsChange?.(settings)
    setHasUnsavedChanges(false)
  }

  const resetSettings = () => {
    setSettings(initialSettings || DEFAULT_SHOP_SETTINGS)
    setHasUnsavedChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing Management</h2>
          <p className="text-muted-foreground">Configure dynamic pricing rules and factors</p>
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Alert className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>You have unsaved changes</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" onClick={resetSettings}>
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={!hasUnsavedChanges}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="factors">Factors</TabsTrigger>
              <TabsTrigger value="membership">Members</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="labor-rate">Labor Rate ($/hour)</Label>
                      <Input
                        id="labor-rate"
                        type="number"
                        value={settings.laborRate}
                        onChange={(e) => updateSettings({ laborRate: Number.parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skill-markup">Skill Markup (%)</Label>
                      <Input
                        id="skill-markup"
                        type="number"
                        value={Math.round(settings.skillMarkup * 100)}
                        onChange={(e) =>
                          updateSettings({ skillMarkup: (Number.parseFloat(e.target.value) || 0) / 100 })
                        }
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location-surcharge">Location Surcharge (%)</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.locationSurcharge * 100]}
                        onValueChange={([value]) => updateSettings({ locationSurcharge: value / 100 })}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>{Math.round(settings.locationSurcharge * 100)}%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workload-threshold">Workload Surge Threshold (%)</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.workloadThreshold * 100]}
                        onValueChange={([value]) => updateSettings({ workloadThreshold: value / 100 })}
                        min={50}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>50%</span>
                        <span>{Math.round(settings.workloadThreshold * 100)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Factors */}
            <TabsContent value="factors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Pricing Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Filthiness Multipliers</Label>
                    {Object.entries(settings.filthinessFactors).map(([level, factor]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{level}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">×</span>
                          <Input
                            type="number"
                            value={factor}
                            onChange={(e) =>
                              updateSettings({
                                filthinessFactors: {
                                  ...settings.filthinessFactors,
                                  [level]: Number.parseFloat(e.target.value) || 1.0,
                                },
                              })
                            }
                            className="w-20 text-center"
                            min="1.0"
                            max="3.0"
                            step="0.1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="damage-multiplier">Damage Severity Multiplier</Label>
                      <Input
                        id="damage-multiplier"
                        type="number"
                        value={settings.damageSeverityMultiplier}
                        onChange={(e) =>
                          updateSettings({ damageSeverityMultiplier: Number.parseFloat(e.target.value) || 0 })
                        }
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area-price">Area Unit Price ($/m²)</Label>
                      <Input
                        id="area-price"
                        type="number"
                        value={settings.areaUnitPrice}
                        onChange={(e) => updateSettings({ areaUnitPrice: Number.parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Membership Settings */}
            <TabsContent value="membership" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Membership Discounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.membershipDiscounts).map(([tier, discount]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={tier === "Platinum" ? "default" : "secondary"}>{tier}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={Math.round(discount * 100)}
                          onChange={(e) =>
                            updateSettings({
                              membershipDiscounts: {
                                ...settings.membershipDiscounts,
                                [tier]: (Number.parseFloat(e.target.value) || 0) / 100,
                              },
                            })
                          }
                          className="w-20 text-center"
                          min="0"
                          max="50"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Packages */}
            <TabsContent value="packages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Service Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.servicePackages).map(([sku, pkg]) => (
                    <div key={sku} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <Badge variant="outline">{sku}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Base Price ($)</Label>
                          <Input
                            type="number"
                            value={pkg.basePrice}
                            onChange={(e) =>
                              updateSettings({
                                servicePackages: {
                                  ...settings.servicePackages,
                                  [sku]: {
                                    ...pkg,
                                    basePrice: Number.parseFloat(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (hours)</Label>
                          <Input
                            type="number"
                            value={pkg.defaultDurationHrs}
                            onChange={(e) =>
                              updateSettings({
                                servicePackages: {
                                  ...settings.servicePackages,
                                  [sku]: {
                                    ...pkg,
                                    defaultDurationHrs: Number.parseFloat(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>See how your pricing changes affect estimates in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              {previewParams ? (
                <PricingBreakdownComponent
                  params={previewParams}
                  vehicleMake={sampleVehicle.make}
                  vehicleModel={sampleVehicle.model}
                  vehicleYear={sampleVehicle.year}
                  servicePackageName="Premium Detail Package"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure settings to see pricing preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Avg. Labor Rate</div>
                    <div className="text-lg font-semibold">${settings.laborRate}/hr</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Max Discount</div>
                    <div className="text-lg font-semibold">
                      {Math.max(...Object.values(settings.membershipDiscounts)) * 100}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
