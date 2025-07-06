interface VinDecodeResponse {
  Results: Array<Record<string, any>>
}

export interface VehicleInfo {
  // Core identification
  make: string
  model: string
  year: string
  trim: string

  // Physical characteristics
  bodyClass: string
  vehicleType: string
  doors: string

  // Engine specifications
  cylinders: string
  displacement: string
  fuelType: string
  driveType: string

  // Manufacturing details
  plantCity: string
  plantCountry: string
  manufacturer: string

  // Weight and capacity
  gvwr: string

  // API response metadata
  errorCode: string
  errorText: string
}

// Cache for VIN lookups to avoid rate limiting
const vinCache = new Map<string, VehicleInfo>()

export async function fetchVehicleSpecs(vin: string): Promise<VehicleInfo> {
  // Check cache first
  if (vinCache.has(vin)) {
    return vinCache.get(vin)!
  }

  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SlickSolutions-VehicleInspection/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data: VinDecodeResponse = await response.json()

    if (!data.Results || data.Results.length === 0) {
      throw new Error("No vehicle data found for this VIN")
    }

    const v = data.Results[0]

    // Check for API errors
    if (v.ErrorCode && v.ErrorCode !== "0") {
      throw new Error(v.ErrorText || "Invalid VIN")
    }

    const vehicleInfo: VehicleInfo = {
      // Core identification - used for form pre-fill and AI assessment
      make: v.Make || "Unknown",
      model: v.Model || "Unknown",
      year: v.ModelYear || "Unknown",
      trim: v.Trim || "Unknown",

      // Physical characteristics - guides cleaning tools and detailing scope
      bodyClass: v.BodyClass || "Unknown",
      vehicleType: v.VehicleType || "Unknown",
      doors: v.Doors || "Unknown",

      // Engine specifications - affects engine-bay cleaning packages
      cylinders: v.EngineCylinders || "Unknown",
      displacement: v.DisplacementL || "Unknown",
      fuelType: v.FuelTypePrimary || "Unknown", // Identifies safe chemicals for hybrid/electric
      driveType: v.DriveType || "Unknown", // 4WD vs 2WD changes undercarriage cleaning

      // Manufacturing details - offers context for regional regulations
      plantCity: v.PlantCity || "Unknown",
      plantCountry: v.PlantCountry || "Unknown",
      manufacturer: v.Manufacturer || "Unknown",

      // Weight and capacity - helps scope heavy-duty vs standard wash
      gvwr: v.GrossVehicleWeightRating || "Unknown",

      // API response metadata
      errorCode: v.ErrorCode || "0",
      errorText: v.ErrorText || "",
    }

    // Cache successful results
    if (vehicleInfo.errorCode === "0") {
      vinCache.set(vin, vehicleInfo)
    }

    return vehicleInfo
  } catch (error) {
    console.error("VIN decode error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to decode VIN")
  }
}

// Legacy function for backward compatibility
export async function decodeVin(vin: string): Promise<VehicleInfo> {
  return fetchVehicleSpecs(vin)
}

export function validateVin(vin: string): boolean {
  // VIN must be exactly 17 characters
  if (vin.length !== 17) return false

  // VIN uses specific character set (excludes I, O, Q)
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false

  return true
}

export function formatVin(vin: string): string {
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "")
}

// Pricing logic helpers based on vehicle specs
export function getVehiclePricingModifiers(vehicle: VehicleInfo) {
  const modifiers = {
    ageFactor: 1.0,
    sizeFactor: 1.0,
    complexityFactor: 1.0,
    specialtyFactor: 1.0,
  }

  // Age-based pricing adjustments
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - Number.parseInt(vehicle.year)
  if (vehicleAge > 15) modifiers.ageFactor = 1.2 // Older vehicles need more care
  if (vehicleAge < 3) modifiers.ageFactor = 1.1 // Newer vehicles require premium service

  // Size-based adjustments
  if (vehicle.bodyClass.toLowerCase().includes("truck") || vehicle.bodyClass.toLowerCase().includes("suv")) {
    modifiers.sizeFactor = 1.3
  }

  // Complexity based on drive type
  if (vehicle.driveType.toLowerCase().includes("4wd") || vehicle.driveType.toLowerCase().includes("awd")) {
    modifiers.complexityFactor = 1.15 // More undercarriage work
  }

  // Specialty handling for luxury/electric
  if (vehicle.fuelType.toLowerCase().includes("electric") || vehicle.fuelType.toLowerCase().includes("hybrid")) {
    modifiers.specialtyFactor = 1.25 // Special chemicals and procedures
  }

  return modifiers
}

// Service recommendations based on vehicle specs
export function getServiceRecommendations(vehicle: VehicleInfo) {
  const recommendations = []

  // Engine-specific services
  if (Number.parseInt(vehicle.cylinders) >= 8) {
    recommendations.push("Premium engine bay detailing recommended for V8+ engines")
  }

  // Fuel type specific
  if (vehicle.fuelType.toLowerCase().includes("electric")) {
    recommendations.push("Electric vehicle safe cleaning products required")
  }

  // Body class specific
  if (vehicle.bodyClass.toLowerCase().includes("convertible")) {
    recommendations.push("Soft-top protection and conditioning recommended")
  }

  // Trim specific
  if (vehicle.trim.toLowerCase().includes("leather")) {
    recommendations.push("Leather conditioning package recommended")
  }

  return recommendations
}
