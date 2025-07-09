"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { z } from "zod"
import { Clock, Globe, Bell, Shield, Database, Zap, Save } from "lucide-react"
import { toast } from "sonner"

const businessHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
})

interface SystemSettingsProps {
  shopId: Id<"shops">
}

export function SystemSettings({ shopId }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState("general")

  const shop = useQuery(api.shops.get, { id: shopId })
  const updateSettings = useMutation(api.shops.updateSettings)

  const [businessHours, setBusinessHours] = useState(
    shop?.settings.businessHours || {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true },
    },
  )

  const [features, setFeatures] = useState(shop?.settings.features || [])
  const [timezone, setTimezone] = useState(shop?.settings.timezone || "UTC")
  const [currency, setCurrency] = useState(shop?.settings.currency || "USD")

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        shopId,
        settings: {
          timezone,
          currency,
          businessHours,
          features,
        },
      })
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    }
  }

  const toggleFeature = (feature: string) => {
    setFeatures((prev) => (prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]))
  }

  const updateBusinessHour = (day: string, field: string, value: string | boolean) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const availableFeatures = [
    { id: "inspections", name: "Vehicle Inspections", description: "Core inspection functionality" },
    { id: "pricing", name: "Dynamic Pricing", description: "AI-powered pricing engine" },
    { id: "scheduling", name: "Appointment Scheduling", description: "Calendar and booking system" },
    { id: "ai-analysis", name: "AI Damage Analysis", description: "Computer vision damage detection" },
    { id: "customer-portal", name: "Customer Portal", description: "Self-service customer interface" },
    { id: "reporting", name: "Advanced Reporting", description: "Analytics and business insights" },
    { id: "integrations", name: "Third-party Integrations", description: "Connect with external systems" },
    { id: "mobile-app", name: "Mobile App", description: "iOS and Android applications" },
  ]

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "JPY", name: "Japanese Yen" },
  ]

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  if (!shop) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-gray-600">Configure your shop settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business Hours</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Configure timezone and currency preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.code} - {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Subscription Information
              </CardTitle>
              <CardDescription>Current plan and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Current Plan</div>
                  <div className="text-sm text-gray-600">
                    {shop.subscription.plan.charAt(0).toUpperCase() + shop.subscription.plan.slice(1)}
                  </div>
                </div>
                <Badge variant={shop.subscription.status === "active" ? "default" : "destructive"}>
                  {shop.subscription.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Expires</div>
                  <div className="text-sm text-gray-600">
                    {new Date(shop.subscription.expiresAt).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>Set your operating hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <Label className="capitalize font-medium">{day}</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!businessHours[day as keyof typeof businessHours].closed}
                      onCheckedChange={(checked) => updateBusinessHour(day, "closed", !checked)}
                    />
                    <Label className="text-sm">Open</Label>
                  </div>

                  {!businessHours[day as keyof typeof businessHours].closed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">From:</Label>
                        <Input
                          type="time"
                          value={businessHours[day as keyof typeof businessHours].open}
                          onChange={(e) => updateBusinessHour(day, "open", e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">To:</Label>
                        <Input
                          type="time"
                          value={businessHours[day as keyof typeof businessHours].close}
                          onChange={(e) => updateBusinessHour(day, "close", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}

                  {businessHours[day as keyof typeof businessHours].closed && (
                    <div className="text-sm text-gray-500">Closed</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Management
              </CardTitle>
              <CardDescription>Enable or disable features for your shop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Switch checked={features.includes(feature.id)} onCheckedChange={() => toggleFeature(feature.id)} />
                    <div className="flex-1">
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Advanced data and system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm text-gray-600">Download all your shop data</div>
                  </div>
                  <Button variant="outline">Export</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Backup Settings</div>
                    <div className="text-sm text-gray-600">Create a backup of your configuration</div>
                  </div>
                  <Button variant="outline">Backup</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                  <div>
                    <div className="font-medium text-red-600">Delete Shop</div>
                    <div className="text-sm text-gray-600">Permanently delete this shop and all data</div>
                  </div>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive email alerts for important events</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-gray-600">Receive SMS alerts for urgent matters</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Slack Integration</div>
                    <div className="text-sm text-gray-600">Send notifications to Slack channels</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
