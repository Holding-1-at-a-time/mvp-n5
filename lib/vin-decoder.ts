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

// Enhanced interface for Slick Solutions pricing
export interface SlickVehicleSpecs {
  // Core identification - used for form pre-fill and AI assessment
  year: number
  make: string
  model: string
  trim: string

  // Physical characteristics - guides cleaning tools and detailing scope
  bodyClass: string
  vehicleType: string
  doors: number

  // Engine specifications - affects engine-bay cleaning packages
  cylinders: number
  displacement: number
  fuelType: string
  driveType: string

  // Manufacturing details - offers context for regional regulations
  plantCity: string
  plantCountry: string

  // Weight and capacity - helps scope heavy-duty vs standard wash
  gvwr: number

  // Derived pricing factors
  ageFactor: number
  sizeFactor: number
  complexityFactor: number
  specialtyFactor: number
}

// Cache for VIN lookups to avoid rate limiting
const vinCache = new Map<string, VehicleInfo>()

export async function fetchVehicleSpecs(vin: string): Promise<SlickVehicleSpecs> {
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

    // Extract focused data for Slick Solutions
    const specs: SlickVehicleSpecs = {
      // Core identification
      year: Number.parseInt(v.ModelYear) || new Date().getFullYear(),
      make: v.Make || "Unknown",
      model: v.Model || "Unknown",
      trim: v.Trim || "Base",

      // Physical characteristics
      bodyClass: v.BodyClass || "Unknown",
      vehicleType: v.VehicleType || "Passenger Car",
      doors: Number.parseInt(v.Doors) || 4,

      // Engine specifications
      cylinders: Number.parseInt(v.EngineCylinders) || 4,
      displacement: Number.parseFloat(v.DisplacementL) || 2.0,
      fuelType: v.FuelTypePrimary || "Gasoline",
      driveType: v.DriveType || "FWD",

      // Manufacturing details
      plantCity: v.PlantCity || "Unknown",
      plantCountry: v.PlantCountry || "Unknown",

      // Weight and capacity
      gvwr: Number.parseInt(v.GrossVehicleWeightRating) || 4000,

      // Calculate derived pricing factors
      ageFactor: calculateAgeFactor(Number.parseInt(v.ModelYear)),
      sizeFactor: calculateSizeFactor(v.BodyClass, v.VehicleType),
      complexityFactor: calculateComplexityFactor(v.DriveType, Number.parseInt(v.EngineCylinders)),
      specialtyFactor: calculateSpecialtyFactor(v.FuelTypePrimary, v.Trim),
    }

    return specs
  } catch (error) {
    console.error("VIN decode error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to decode VIN")
  }
}

// Pricing factor calculation functions
function calculateAgeFactor(year: number): number {
  const currentYear = new Date().getFullYear()
  const age = currentYear - year

  if (age > 15) return 0.2 // Older vehicles need more care (+20%)
  if (age > 10) return 0.1 // Moderate age adjustment (+10%)
  if (age < 3) return 0.15 // Newer vehicles require premium service (+15%)
  return 0.05 // Standard age adjustment (+5%)
}

function calculateSizeFactor(bodyClass: string, vehicleType: string): number {
  const body = bodyClass?.toLowerCase() || ""
  const type = vehicleType?.toLowerCase() || ""

  if (body.includes("truck") || body.includes("pickup")) return 0.25
  if (body.includes("suv") || body.includes("sport utility")) return 0.2
  if (body.includes("van") || body.includes("minivan")) return 0.18
  if (body.includes("wagon")) return 0.12
  if (body.includes("coupe") || body.includes("convertible")) return 0.08

  return 0.1 // Standard size factor
}

function calculateComplexityFactor(driveType: string, cylinders: number): number {
  let factor = 0

  // Drive type complexity
  const drive = driveType?.toLowerCase() || ""
  if (drive.includes("4wd") || drive.includes("awd") || drive.includes("4x4")) {
    factor += 0.15 // More undercarriage work
  }

  // Engine complexity
  if (cylinders >= 8) factor += 0.1 // V8+ engines need more attention
  if (cylinders >= 12) factor += 0.05 // V12+ premium engines

  return Math.min(factor, 0.25) // Cap at 25%
}

function calculateSpecialtyFactor(fuelType: string, trim: string): number {
  let factor = 0

  // Fuel type specialty
  const fuel = fuelType?.toLowerCase() || ""
  if (fuel.includes("electric")) factor += 0.3 // Special EV procedures
  if (fuel.includes("hybrid")) factor += 0.2 // Hybrid-safe chemicals
  if (fuel.includes("diesel")) factor += 0.1 // Diesel-specific treatments

  // Trim level specialty
  const trimLevel = trim?.toLowerCase() || ""
  if (trimLevel.includes("luxury") || trimLevel.includes("premium")) factor += 0.15
  if (trimLevel.includes("sport") || trimLevel.includes("performance")) factor += 0.12
  if (trimLevel.includes("limited") || trimLevel.includes("platinum")) factor += 0.18

  return Math.min(factor, 0.35) // Cap at 35%
}

// Legacy function for backward compatibility
export async function decodeVin(vin: string): Promise<VehicleInfo> {
  const specs = await fetchVehicleSpecs(vin)

  return {
    make: specs.make,
    model: specs.model,
    year: specs.year.toString(),
    trim: specs.trim,
    bodyClass: specs.bodyClass,
    vehicleType: specs.vehicleType,
    doors: specs.doors.toString(),
    cylinders: specs.cylinders.toString(),
    displacement: specs.displacement.toString(),
    fuelType: specs.fuelType,
    driveType: specs.driveType,
    plantCity: specs.plantCity,
    plantCountry: specs.plantCountry,
    manufacturer: "Unknown", // Not in SlickVehicleSpecs
    gvwr: specs.gvwr.toString(),
    errorCode: "0",
    errorText: "",
  }
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

// Service recommendations based on vehicle specs
export function getServiceRecommendations(specs: SlickVehicleSpecs): string[] {
  const recommendations = []

  // Engine-specific services
  if (specs.cylinders >= 8) {
    recommendations.push("Premium engine bay detailing recommended for V8+ engines")
  }

  // Fuel type specific
  if (specs.fuelType.toLowerCase().includes("electric")) {
    recommendations.push("Electric vehicle safe cleaning products required")
  }

  if (specs.fuelType.toLowerCase().includes("hybrid")) {
    recommendations.push("Hybrid-safe chemicals and procedures required")
  }

  // Body class specific
  if (specs.bodyClass.toLowerCase().includes("convertible")) {
    recommendations.push("Soft-top protection and conditioning recommended")
  }

  if (specs.bodyClass.toLowerCase().includes("truck")) {
    recommendations.push("Heavy-duty undercarriage cleaning recommended")
  }

  // Trim specific
  if (specs.trim.toLowerCase().includes("leather")) {
    recommendations.push("Leather conditioning package recommended")
  }

  // Age-based recommendations
  const currentYear = new Date().getFullYear()
  const age = currentYear - specs.year

  if (age > 10) {
    recommendations.push("Deep restoration package recommended for older vehicles")
  }

  if (age < 2) {
    recommendations.push("Paint protection film application available for new vehicles")
  }

  return recommendations
}

// Pricing modifiers for backward compatibility
export function getVehiclePricingModifiers(vehicle: VehicleInfo | SlickVehicleSpecs) {
  if ("ageFactor" in vehicle) {
    // New SlickVehicleSpecs format
    return {
      ageFactor: vehicle.ageFactor,
      sizeFactor: vehicle.sizeFactor,
      complexityFactor: vehicle.complexityFactor,
      specialtyFactor: vehicle.specialtyFactor,
    }
  }

  // Legacy VehicleInfo format
  const modifiers = {
    ageFactor: 1.0,
    sizeFactor: 1.0,
    complexityFactor: 1.0,
    specialtyFactor: 1.0,
  }

  // Age-based pricing adjustments
  const currentYear = new Date().getFullYear()
  const vehicleAge = currentYear - Number.parseInt(vehicle.year)
  if (vehicleAge > 15) modifiers.ageFactor = 1.2
  if (vehicleAge < 3) modifiers.ageFactor = 1.1

  // Size-based adjustments
  if (vehicle.bodyClass.toLowerCase().includes("truck") || vehicle.bodyClass.toLowerCase().includes("suv")) {
    modifiers.sizeFactor = 1.3
  }

  // Complexity based on drive type
  if (vehicle.driveType.toLowerCase().includes("4wd") || vehicle.driveType.toLowerCase().includes("awd")) {
    modifiers.complexityFactor = 1.15
  }

  // Specialty handling for luxury/electric
  if (vehicle.fuelType.toLowerCase().includes("electric") || vehicle.fuelType.toLowerCase().includes("hybrid")) {
    modifiers.specialtyFactor = 1.25
  }

  return modifiers
}
