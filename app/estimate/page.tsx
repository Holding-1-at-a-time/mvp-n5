"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { formatCurrency } from "@/lib/utils"
import { Loader2, PlusCircle, MinusCircle, Save, Printer, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ShopSettings } from "@/lib/pricing-engine"

interface EstimateItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  type: "service" | "material" // Added type for tax calculation
}

export default function EstimatePage() {
  const { toast } = useToast()
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([])
  const [shopId, setShopId] = useState<string>("default_shop_id") // Replace with actual shop ID from auth
  const shopSettings = useQuery(api.pricing.getShopSettings, { shopId })
  const updateInspectionPricing = useMutation(api.pricing.updateInspectionPricing)

  useEffect(() => {
    // Initialize with some default items if empty
    if (estimateItems.length === 0 && shopSettings) {
      setEstimateItems([
        {
          id: "svc-1",
          description: "Premium Detail Package",
          quantity: 1,
          unitPrice: shopSettings.servicePackages.premium_detail.basePrice,
          type: "service",
        },
        {
          id: "mat-1",
          description: "Ceramic Coating Material",
          quantity: 1,
          unitPrice: 75.0,
          type: "material",
        },
        {
          id: "svc-2",
          description: "Odor Removal Service",
          quantity: 1,
          unitPrice: 50.0,
          type: "service",
        },
      ])
    }
  }, [estimateItems.length, shopSettings])

  const handleAddItem = () => {
    setEstimateItems([
      ...estimateItems,
      {
        id: `new-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        type: "service", // Default to service
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setEstimateItems(estimateItems.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof EstimateItem, value: any) => {
    setEstimateItems(estimateItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return estimateItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateServiceSubtotal = () => {
    return estimateItems
      .filter((item) => item.type === "service")
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateMaterialSubtotal = () => {
    return estimateItems
      .filter((item) => item.type === "material")
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateServiceTax = (serviceSubtotal: number, settings: ShopSettings) => {
    return serviceSubtotal * settings.serviceTaxRate
  }

  const calculateMaterialTax = (materialSubtotal: number, settings: ShopSettings) => {
    return materialSubtotal * settings.materialTaxRate
  }

  const calculateTotal = () => {
    if (!shopSettings) return 0
    const serviceSubtotal = calculateServiceSubtotal()
    const materialSubtotal = calculateMaterialSubtotal()
    const serviceTax = calculateServiceTax(serviceSubtotal, shopSettings)
    const materialTax = calculateMaterialTax(materialSubtotal, shopSettings)
    return serviceSubtotal + materialSubtotal + serviceTax + materialTax
  }

  const subtotal = calculateSubtotal()
  const serviceSubtotal = calculateServiceSubtotal()
  const materialSubtotal = calculateMaterialSubtotal()
  const serviceTax = shopSettings ? calculateServiceTax(serviceSubtotal, shopSettings) : 0
  const materialTax = shopSettings ? calculateMaterialTax(materialSubtotal, shopSettings) : 0
  const total = calculateTotal()

  const handleSaveEstimate = async () => {
    if (!shopSettings) {
      toast({
        title: "Error",
        description: "Shop settings not loaded. Cannot save estimate.",
        variant: "destructive",
      })
      return
    }

    // This is a placeholder for a real inspection ID.
    // In a real app, this would come from the current inspection context.
    const dummyInspectionId: Id<"inspections"> = "12345" as Id<"inspections">

    try {
      // You would typically build more comprehensive pricingParams here
      // based on actual vehicle, damage, customer, and market data.
      // For this example, we'll use simplified dummy data.
      const dummyPricingParams = {
        basePrice: subtotal,
        defaultDuration: 1,
        techCount: 1,
        filthinessFactor: 1,
        ageFactor: 0,
        bodyFactor: 0,
        damageFactor: 0,
        areaFactor: 0,
        laborRate: shopSettings.laborRate,
        skillMarkup: shopSettings.skillMarkup,
        workloadFactor: 1,
        locationSurcharge: shopSettings.locationSurcharge,
        membershipDiscount: 0,
        loyaltyCredit: 0,
        weatherFactor: 1,
        seasonalFactor: 1,
        competitorFactor: 0,
      }

      const dummyPriceBreakdown = {
        basePrice: subtotal,
        laborCost: 0,
        damageSurcharge: 0,
        areaSurcharge: 0,
        filthinessFactor: 1,
        workloadFactor: 1,
        locationSurcharge: 0,
        weatherSurcharge: 0,
        seasonalAdjustment: 0,
        competitorAdjustment: 0,
        membershipDiscount: 0,
        loyaltyCredit: 0,
        subtotal: subtotal,
        total: total,
        savings: 0,
      }

      await updateInspectionPricing({
        inspectionId: dummyInspectionId,
        pricingParams: dummyPricingParams,
        estimateAmount: total,
        priceBreakdown: dummyPriceBreakdown,
        serviceRecommendations: estimateItems.map((item) => item.description),
      })

      toast({
        title: "Success",
        description: "Estimate saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save estimate:", error)
      toast({
        title: "Error",
        description: "Failed to save estimate. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!shopSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading shop settings...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Vehicle Service Estimate</CardTitle>
            <CardDescription>Create and manage detailed service estimates for your customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estimate Items */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Items & Services</h3>
              {estimateItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-3">
                    <Label htmlFor={`description-${item.id}`} className="sr-only">
                      Description
                    </Label>
                    <Input
                      id={`description-${item.id}`}
                      placeholder="Item Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${item.id}`} className="sr-only">
                      Quantity
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-price-${item.id}`} className="sr-only">
                      Unit Price
                    </Label>
                    <Input
                      id={`unit-price-${item.id}`}
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-type-${item.id}`} className="sr-only">
                      Type
                    </Label>
                    <Select
                      value={item.type}
                      onValueChange={(value: "service" | "material") => handleItemChange(item.id, "type", value)}
                    >
                      <SelectTrigger id={`item-type-${item.id}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                    <MinusCircle className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddItem} className="w-full bg-transparent">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Separator />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-right">
              <div className="font-medium">Subtotal:</div>
              <div>{formatCurrency(subtotal)}</div>

              <div className="font-medium">Service Tax ({Math.round(shopSettings.serviceTaxRate * 100)}%):</div>
              <div>{formatCurrency(serviceTax)}</div>

              <div className="font-medium">Material Tax ({Math.round(shopSettings.materialTaxRate * 100)}%):</div>
              <div>{formatCurrency(materialTax)}</div>

              <div className="text-2xl font-bold">Total:</div>
              <div className="text-2xl font-bold">{formatCurrency(total)}</div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSaveEstimate}>
              <Save className="h-4 w-4 mr-2" />
              Save Estimate
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
