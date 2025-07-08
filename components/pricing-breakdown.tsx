"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Info,
  Percent,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Cloud,
  Calendar,
  Target,
  Gift,
  Star,
} from "lucide-react"
import { useState } from "react"
import { type PricingParams, generatePriceBreakdown } from "@/lib/pricing-engine"

interface PricingBreakdownProps {
  params: PricingParams
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  servicePackageName?: string
  onAdjustParams?: (newParams: Partial<PricingParams>) => void
}

export function PricingBreakdownComponent({
  params,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  servicePackageName,
  onAdjustParams,
}: PricingBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false)
  const breakdown = generatePriceBreakdown(params)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${Math.round((value - 1) * 100)}%`
  }

  const getFactorColor = (factor: number) => {
    if (factor > 1.2) return "text-red-600"
    if (factor > 1.1) return "text-orange-600"
    if (factor > 1.0) return "text-yellow-600"
    return "text-green-600"
  }

  const getSavingsColor = (savings: number) => {
    if (savings > 50) return "text-green-600"
    if (savings > 20) return "text-blue-600"
    return "text-gray-600"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span>Price Estimate</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(breakdown.total)}</div>
            {breakdown.savings > 0 && (
              <div className={`text-sm ${getSavingsColor(breakdown.savings)}`}>
                You save {formatCurrency(breakdown.savings)}
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          {vehicleMake && vehicleModel && vehicleYear && (
            <span>
              {vehicleYear} {vehicleMake} {vehicleModel}
            </span>
          )}
          {servicePackageName && <span> • {servicePackageName}</span>}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-semibold text-blue-600">{formatCurrency(breakdown.basePrice)}</div>
            <div className="text-xs text-blue-800">Base Price</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Users className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-semibold text-green-600">
              {params.techCount} Tech{params.techCount > 1 ? "s" : ""}
            </div>
            <div className="text-xs text-green-800">
              {params.durationHrs ?? params.defaultDuration}h @ ${params.laborRate}/hr
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-semibold text-purple-600">{formatPercent(breakdown.filthinessFactor)}</div>
            <div className="text-xs text-purple-800">Condition Factor</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Target className="h-6 w-6 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-semibold text-orange-600">
              {Math.round((breakdown.total / breakdown.basePrice) * 100)}%
            </div>
            <div className="text-xs text-orange-800">vs Base Price</div>
          </div>
        </div>

        <Separator />

        {/* Detailed Breakdown Toggle */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                {showDetails ? "Hide" : "Show"} Detailed Breakdown
              </span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            {/* Base Costs */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Base Costs</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Service Package</span>
                  <span className="font-mono">{formatCurrency(breakdown.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Labor ({params.techCount} × {params.durationHrs ?? params.defaultDuration}h @ ${params.laborRate}
                    /hr)
                  </span>
                  <span className="font-mono">{formatCurrency(breakdown.laborCost)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vehicle & Condition Adjustments */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Vehicle & Condition</h4>
              <div className="space-y-1 text-sm">
                {breakdown.damageSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Damage Surcharge</span>
                    <span className="font-mono text-orange-600">+{formatCurrency(breakdown.damageSurcharge)}</span>
                  </div>
                )}
                {breakdown.areaSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Large Area Surcharge</span>
                    <span className="font-mono text-orange-600">+{formatCurrency(breakdown.areaSurcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Condition Factor
                  </span>
                  <span className={`font-mono ${getFactorColor(breakdown.filthinessFactor)}`}>
                    ×{breakdown.filthinessFactor.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Market & Operational Factors */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Market Factors</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Workload Factor
                  </span>
                  <span className={`font-mono ${getFactorColor(breakdown.workloadFactor)}`}>
                    ×{breakdown.workloadFactor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location Surcharge
                  </span>
                  <span className="font-mono text-blue-600">+{Math.round(breakdown.locationSurcharge * 100)}%</span>
                </div>
                {breakdown.weatherSurcharge !== 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      Weather Adjustment
                    </span>
                    <span
                      className={`font-mono ${breakdown.weatherSurcharge > 0 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {breakdown.weatherSurcharge > 0 ? "+" : ""}
                      {formatCurrency(breakdown.weatherSurcharge)}
                    </span>
                  </div>
                )}
                {breakdown.seasonalAdjustment !== 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Seasonal Adjustment
                    </span>
                    <span
                      className={`font-mono ${breakdown.seasonalAdjustment > 0 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {breakdown.seasonalAdjustment > 0 ? "+" : ""}
                      {formatCurrency(breakdown.seasonalAdjustment)}
                    </span>
                  </div>
                )}
                {breakdown.competitorAdjustment !== 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Market Adjustment
                    </span>
                    <span
                      className={`font-mono ${breakdown.competitorAdjustment > 0 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {breakdown.competitorAdjustment > 0 ? "+" : ""}
                      {formatCurrency(breakdown.competitorAdjustment)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Discounts & Credits */}
            {(breakdown.membershipDiscount > 0 || breakdown.loyaltyCredit > 0) && (
              <>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Savings</h4>
                  <div className="space-y-1 text-sm">
                    {breakdown.membershipDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Membership Discount
                        </span>
                        <span className="font-mono text-green-600">
                          -{formatCurrency(breakdown.membershipDiscount)}
                        </span>
                      </div>
                    )}
                    {breakdown.loyaltyCredit > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          Loyalty Credit
                        </span>
                        <span className="font-mono text-green-600">-{formatCurrency(breakdown.loyaltyCredit)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Final Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="font-mono text-blue-600">{formatCurrency(breakdown.total)}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Value Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Transparent pricing with no hidden fees</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>AI-powered damage assessment included</span>
          </div>
        </div>

        {/* Progress bar showing value vs base price */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Base Service</span>
            <span>Premium Value</span>
          </div>
          <Progress value={Math.min((breakdown.total / (breakdown.basePrice * 2)) * 100, 100)} className="h-2" />
          <div className="text-xs text-center text-gray-500">
            {breakdown.total > breakdown.basePrice * 1.5
              ? "Premium service with extensive customization"
              : breakdown.total > breakdown.basePrice * 1.2
                ? "Enhanced service with quality upgrades"
                : "Great value with professional service"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
