"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { type PricingParams, calculateEstimate } from "@/lib/pricing-engine"
import { DollarSign, Wrench, Car, Tag, Percent, Star } from "lucide-react"

interface PricingBreakdownComponentProps {
  params: PricingParams
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  servicePackageName: string
}

export function PricingBreakdownComponent({
  params,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  servicePackageName,
}: PricingBreakdownComponentProps) {
  const {
    baseCost,
    laborCost,
    partsCost,
    damageFactorCost,
    filthinessFactorCost,
    locationSurchargeCost,
    workloadSurgeCost,
    membershipDiscountAmount,
    totalEstimate,
  } = calculateEstimate(params)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Estimate Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          For a {vehicleYear} {vehicleMake} {vehicleModel} - {servicePackageName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Base Costs:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Base Service Price:</span>
              <span className="font-medium">${params.servicePackage.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Labor Cost:</span>
              <span className="font-medium">${laborCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Parts Cost:</span>
              <span className="font-medium">${partsCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Skill Markup ({params.shopSettings.skillMarkup * 100}%):</span>
              <span className="font-medium">${(baseCost * params.shopSettings.skillMarkup).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
            <span>Subtotal (Base):</span>
            <span>${baseCost.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Dynamic Factors:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Damage Factor ({params.damageMetrics.averageSeverity.toFixed(2)} avg severity):</span>
              <span className="font-medium">${damageFactorCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Filthiness Factor ({params.filthinessLevel}):</span>
              <span className="font-medium">${filthinessFactorCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Location Surcharge ({params.shopSettings.locationSurcharge * 100}%):</span>
              <span className="font-medium">${locationSurchargeCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Workload Surge ({params.workloadFactor * 100}%):</span>
              <span className="font-medium">${workloadSurgeCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Discounts:</h3>
          <div className="flex items-center justify-between text-sm">
            <span>
              Membership Discount ({params.customer.membershipTier} -{" "}
              {params.shopSettings.membershipDiscounts[params.customer.membershipTier] * 100}%):
            </span>
            <span className="font-medium text-green-600">-${membershipDiscountAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center text-2xl font-bold text-blue-600">
          <span>Total Estimate:</span>
          <span>${totalEstimate.toFixed(2)}</span>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-lg">Factors Applied:</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Car className="h-3 w-3" /> Vehicle Specs
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wrench className="h-3 w-3" /> Damage Assessment
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" /> Service Package
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Percent className="h-3 w-3" /> Filthiness: {params.filthinessLevel}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Percent className="h-3 w-3" /> Workload: {(params.workloadFactor * 100).toFixed(0)}%
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Percent className="h-3 w-3" /> Location: {(params.shopSettings.locationSurcharge * 100).toFixed(0)}%
            </Badge>
            {params.customer.membershipTier !== "None" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" /> Membership: {params.customer.membershipTier}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
