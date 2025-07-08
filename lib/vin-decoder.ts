export interface SlickVehicleSpecs {
  // Basic vehicle information
  year: number
  make: string
  model: string
  trim: string
  bodyClass: string
  vehicleType: string
  doors: number

  // Engine specifications
  cylinders: number
  displacement: number // in liters
  fuelType: string
  driveType: string

  // Manufacturing details
  plantCity: string
  plantCountry: string
  gvwr: number // Gross Vehicle Weight Rating

  // Calculated pricing factors
  ageFactor: number
  sizeFactor: number
  complexityFactor: number
  specialtyFactor: number
}

export interface VinDecodeError {
  code: string
  message: string
  details?: string
}

/**
 * Validates VIN format (17 characters, no I, O, Q)
 */
export function validateVin(vin: string): boolean {
  if (!vin || vin.length !== 17) return false
  
  // VINs cannot contain I, O, or Q
  const invalidChars = /[IOQ]/i
  if (invalidChars.test(vin)) return false
  
  // Basic alphanumeric check
  const validChars = /^[A-HJ-NPR-Z0-9]{17}$/i
  return validChars.test(vin)
}

/**
 * Formats VIN by removing spaces and converting to uppercase
 */
export function formatVin(vin: string): string {
  return vin.replace(/\s/g, '').toUpperCase()
}

/**
 * Fetches vehicle specifications from NHTSA vPIC API
 */
export async function fetchVehicleSpecs(vin: string): Promise<SlickVehicleSpecs> {
  const formattedVin = formatVin(vin)
  
  if (!validateVin(formattedVin)) {
    throw new Error('Invalid VIN format. VIN must be 17 characters and cannot contain I, O, or Q.')
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${formattedVin}?format=json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No vehicle data found for this VIN')
    }

    const vehicle = data.Results[0]

    // Check for decode errors
    if (vehicle.ErrorCode && vehicle.ErrorCode !== '0') {
      throw new Error(`VIN decode error: ${vehicle.ErrorText || 'Unknown error'}`)
    }

    // Extract and validate required fields
    const specs = extractVehicleSpecs(vehicle)
    
    // Calculate pricing factors
    specs.ageFactor = calculateAgeFactor(specs.year)
    specs.sizeFactor = calculateSizeFactor(specs.bodyClass, specs.vehicleType, specs.gvwr)
    specs.complexityFactor = calculateComplexityFactor(specs.driveType, specs.cylinders)
    specs.specialtyFactor = calculateSpecialtyFactor(specs.fuelType, specs.make)

    return specs

  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to decode VIN. Please check the VIN and try again.')
  }
}

/**
 * Extracts vehicle specifications from NHTSA API response
 */
function extractVehicleSpecs(vehicle: any): Omit<SlickVehicleSpecs, 'ageFactor' | 'sizeFactor' | 'complexityFactor' | 'specialtyFactor'> {
  return {
    year: parseInt(vehicle.ModelYear) || new Date().getFullYear(),
    make: vehicle.Make || 'Unknown',
    model: vehicle.Model ||
