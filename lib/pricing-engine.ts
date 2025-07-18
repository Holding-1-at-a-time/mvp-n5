import type { SlickVehicleSpecs } from "./vin-decoder"

// Core pricing parameter types
export interface PricingParams {
  // Base service parameters
  basePrice: number
  defaultDuration: number
  durationHrs?: number
  techCount: number

  // Vehicle-derived factors
  filthinessFactor: number
  ageFactor: number
  bodyFactor: number
  damageFactor: number
  areaFactor: number

  // Shop operational parameters
  laborRate: number
  skillMarkup: number
  workloadFactor: number
  locationSurcharge: number

  // Customer parameters
  membershipDiscount: number
  loyaltyCredit: number

  // External factors
  weatherFactor: number
  seasonalFactor: number
  competitorFactor: number
}

export interface DamageMetrics {
  count: number
  averageSeverity: number
  totalArea: number // in square meters
  types: string[]
  locations: string[]
}

export interface ShopSettings {
  shopId: string
  laborRate: number
  skillMarkup: number
  locationSurcharge: number
  membershipDiscounts: Record<string, number>
  workloadThreshold: number
  filthinessFactors: Record<string, number>
  damageSeverityMultiplier: number
  areaUnitPrice: number
  servicePackages: Record<string, ServicePackage>
  serviceTaxRate: number // New field
  materialTaxRate: number // New field
}

export interface ServicePackage {
  sku: string
  name: string
  description: string
  basePrice: number
  defaultDurationHrs: number
  filthinessFactors: Record<string, number>
  vehicleTypeMultipliers: Record<string, number>
}

export interface CustomerProfile {
  membershipTier: string
  loyaltyPoints: number
  historicalSpend: number
  preferredServices: string[]
}

export interface MarketConditions {
  weatherFactor: number
  seasonalDemand: number
  competitorIndex: number
  localDemand: number
}

// Main pricing calculation engine
export function calculateEstimate(params: PricingParams): number {
  // Base package + static adjustments
  let estimate =
    params.basePrice * (1 + params.ageFactor + params.bodyFactor + params.weatherFactor + params.seasonalFactor)

  // Duration: default or AI-derived if provided
  const hours = params.durationHrs ?? params.defaultDuration
  const laborCost = hours * params.techCount * params.laborRate * (1 + params.skillMarkup)

  // Damage & area surcharges
  const damageCost = params.basePrice * params.damageFactor
  const areaCost = params.basePrice * params.areaFactor

  // Filthiness multiplier
  estimate += laborCost + damageCost + areaCost
  estimate *= params.filthinessFactor * params.workloadFactor * (1 + params.locationSurcharge)

  // Competitor adjustment
  estimate *= 1 + params.competitorFactor

  // Membership & loyalty adjustments
  estimate = estimate * (1 - params.membershipDiscount) - params.loyaltyCredit

  // Floor at zero and round to cents
  return Math.max(0, Math.round(estimate * 100) / 100)
}

// Calculate damage factor from AI assessment
export function calculateDamageFactor(damages: DamageMetrics, multiplier = 0.05): number {
  if (damages.count === 0) return 0

  // Base factor from average severity
  let factor = damages.averageSeverity * multiplier

  // Increase factor based on damage count (diminishing returns)
  const countFactor = Math.log(damages.count + 1) * 0.02
  factor += countFactor

  // Area-based adjustment
  const areaFactor = Math.min(damages.totalArea * 0.01, 0.15) // Cap at 15%
  factor += areaFactor

  return Math.min(factor, 0.5) // Cap total damage factor at 50%
}

// Calculate area factor for large damage coverage
export function calculateAreaFactor(totalArea: number, unitPrice = 2.0): number {
  return Math.min(totalArea * unitPrice * 0.01, 0.3) // Cap at 30%
}

// Calculate filthiness factor from AI assessment
export function calculateFilthinessFactor(
  filthiness: "light" | "moderate" | "heavy" | "extreme",
  factors: Record<string, number> = { light: 1.0, moderate: 1.2, heavy: 1.5, extreme: 1.8 },
): number {
  return factors[filthiness] || 1.0
}

// Calculate workload factor based on shop capacity
export function calculateWorkloadFactor(currentBookings: number, capacity: number, threshold = 0.8): number {
  const utilization = currentBookings / capacity

  if (utilization < threshold) return 1.0
  if (utilization < 0.9) return 1.1 // 10% surge
  if (utilization < 0.95) return 1.2 // 20% surge
  return 1.3 // 30% surge for near-capacity
}

// Calculate weather factor
export function calculateWeatherFactor(
  weatherCondition: "clear" | "rain" | "snow" | "extreme",
  factors: Record<string, number> = { clear: 1.0, rain: 1.08, snow: 1.12, extreme: 1.15 },
): number {
  return factors[weatherCondition] || 1.0
}

// Calculate seasonal demand factor
export function calculateSeasonalFactor(month: number): number {
  // Spring cleaning season (March-May)
  if (month >= 3 && month <= 5) return 1.15

  // Summer peak (June-August)
  if (month >= 6 && month <= 8) return 1.2

  // Fall preparation (September-October)
  if (month >= 9 && month <= 10) return 1.1

  // Winter low season (November-February)
  return 0.95
}

// Build complete pricing parameters from inputs
export function buildPricingParams(
  vehicleSpecs: SlickVehicleSpecs,
  damages: DamageMetrics,
  servicePackage: ServicePackage,
  shopSettings: ShopSettings,
  customerProfile: CustomerProfile,
  marketConditions: MarketConditions,
  techCount = 1,
  filthiness: "light" | "moderate" | "heavy" | "extreme" = "moderate",
): PricingParams {
  return {
    // Base service parameters
    basePrice: servicePackage.basePrice,
    defaultDuration: servicePackage.defaultDurationHrs,
    techCount,

    // Vehicle-derived factors
    filthinessFactor: calculateFilthinessFactor(filthiness, shopSettings.filthinessFactors),
    ageFactor: vehicleSpecs.ageFactor,
    bodyFactor: vehicleSpecs.sizeFactor,
    damageFactor: calculateDamageFactor(damages, shopSettings.damageSeverityMultiplier),
    areaFactor: calculateAreaFactor(damages.totalArea, shopSettings.areaUnitPrice),

    // Shop operational parameters
    laborRate: shopSettings.laborRate,
    skillMarkup: shopSettings.skillMarkup,
    workloadFactor: marketConditions.localDemand,
    locationSurcharge: shopSettings.locationSurcharge,

    // Customer parameters
    membershipDiscount: shopSettings.membershipDiscounts[customerProfile.membershipTier] || 0,
    loyaltyCredit: Math.min(customerProfile.loyaltyPoints * 0.01, 50), // $0.01 per point, max $50

    // External factors
    weatherFactor: marketConditions.weatherFactor,
    seasonalFactor: marketConditions.seasonalDemand,
    competitorFactor: marketConditions.competitorIndex,
  }
}

// Generate detailed price breakdown for transparency
export interface PriceBreakdown {
  basePrice: number
  laborCost: number
  damageSurcharge: number
  areaSurcharge: number
  filthinessFactor: number
  workloadFactor: number
  locationSurcharge: number
  weatherSurcharge: number
  seasonalAdjustment: number
  competitorAdjustment: number
  membershipDiscount: number
  loyaltyCredit: number
  subtotal: number
  total: number
  savings: number
}

export function generatePriceBreakdown(params: PricingParams): PriceBreakdown {
  const hours = params.durationHrs ?? params.defaultDuration
  const laborCost = hours * params.techCount * params.laborRate * (1 + params.skillMarkup)
  const damageSurcharge = params.basePrice * params.damageFactor
  const areaSurcharge = params.basePrice * params.areaFactor

  let subtotal = params.basePrice + laborCost + damageSurcharge + areaSurcharge

  // Apply multipliers
  subtotal *= params.filthinessFactor * params.workloadFactor * (1 + params.locationSurcharge)
  subtotal *= (1 + params.weatherFactor - 1) * (1 + params.seasonalFactor - 1) * (1 + params.competitorFactor)

  const membershipDiscount = subtotal * params.membershipDiscount
  const total = subtotal - membershipDiscount - params.loyaltyCredit
  const savings = membershipDiscount + params.loyaltyCredit

  return {
    basePrice: params.basePrice,
    laborCost,
    damageSurcharge,
    areaSurcharge,
    filthinessFactor: params.filthinessFactor,
    workloadFactor: params.workloadFactor,
    locationSurcharge: params.locationSurcharge,
    weatherSurcharge: (params.weatherFactor - 1) * subtotal,
    seasonalAdjustment: (params.seasonalFactor - 1) * subtotal,
    competitorAdjustment: params.competitorFactor * subtotal,
    membershipDiscount,
    loyaltyCredit: params.loyaltyCredit,
    subtotal,
    total: Math.max(0, total),
    savings,
  }
}

// Validate pricing parameters
export function validatePricingParams(params: PricingParams): string[] {
  const errors: string[] = []

  if (params.basePrice <= 0) errors.push("Base price must be positive")
  if (params.defaultDuration <= 0) errors.push("Default duration must be positive")
  if (params.techCount <= 0) errors.push("Tech count must be positive")
  if (params.laborRate <= 0) errors.push("Labor rate must be positive")
  if (params.membershipDiscount < 0 || params.membershipDiscount > 1) {
    errors.push("Membership discount must be between 0 and 1")
  }
  if (params.loyaltyCredit < 0) errors.push("Loyalty credit cannot be negative")

  return errors
}

// Default shop settings for new installations
export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopId: "",
  laborRate: 75,
  skillMarkup: 0.2,
  locationSurcharge: 0.1,
  membershipDiscounts: {
    Bronze: 0.02,
    Silver: 0.05,
    Gold: 0.1,
    Platinum: 0.15,
  },
  workloadThreshold: 0.8,
  filthinessFactors: {
    light: 1.0,
    moderate: 1.2,
    heavy: 1.5,
    extreme: 1.8,
  },
  damageSeverityMultiplier: 0.05,
  areaUnitPrice: 2.0,
  servicePackages: {
    basic_wash: {
      sku: "basic_wash",
      name: "Basic Wash & Vacuum",
      description: "Exterior wash, interior vacuum, and basic detailing",
      basePrice: 45,
      defaultDurationHrs: 1.5,
      filthinessFactors: { light: 1.0, moderate: 1.1, heavy: 1.3, extreme: 1.5 },
      vehicleTypeMultipliers: { car: 1.0, suv: 1.2, truck: 1.3 },
    },
    premium_detail: {
      sku: "premium_detail",
      name: "Premium Detail Package",
      description: "Complete interior/exterior detail with protection",
      basePrice: 150,
      defaultDurationHrs: 4,
      filthinessFactors: { light: 1.0, moderate: 1.2, heavy: 1.4, extreme: 1.7 },
      vehicleTypeMultipliers: { car: 1.0, suv: 1.25, truck: 1.4 },
    },
  },
  serviceTaxRate: 0.08, // Default service tax rate
  materialTaxRate: 0.07, // Default material tax rate
}
