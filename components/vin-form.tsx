"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Car, CheckCircle, AlertTriangle, Scan } from "lucide-react"
import { fetchVehicleSpecs, validateVin, formatVin, getServiceRecommendations } from "@/lib/vin-decoder"
import type { SlickVehicleSpecs } from "@/lib/vin-decoder"

interface VinFormProps {
  onVehicleDataChange?: (specs: SlickVehicleSpecs | null) => void
  initialVin?: string
  showRecommendations?: boolean
}

export function VinForm({ onVehicleDataChange, initialVin = "", showRecommendations = true }: VinFormProps) {
  const [vin, setVin] = useState(initialVin)
  const [vehicleSpecs, setVehicleSpecs] = useState<SlickVehicleSpecs | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  // Validate VIN as user types
  useEffect(() => {
    const formattedVin = formatVin(vin)
    setVin(formattedVin)
    setIsValid(validateVin(formattedVin))
    setError(null)
  }, [vin])

  // Auto-decode VIN when valid
  useEffect(() => {
    if (isValid && vin.length === 17) {
      handleVinDecode()
    }
  }, [isValid, vin])

  const handleVinDecode = async () => {
    if (!isValid) {
      setError("Please enter a valid 17-character VIN")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const specs = await fetchVehicleSpecs(vin)
      setVehicleSpecs(specs)
      onVehicleDataChange?.(specs)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decode VIN"
      setError(errorMessage)
      setVehicleSpecs(null)
      onVehicleDataChange?.(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVinChange = (value: string) => {
    setVin(value.toUpperCase())
    if (vehicleSpecs) {
      setVehicleSpecs(null)
      onVehicleDataChange?.(null)
    }
  }

  const getVehicleTypeColor = (vehicleType: string) => {
    const type = vehicleType.toLowerCase()
    if (type.includes("truck")) return "bg-orange-100 text-orange-800"
    if (type.includes("suv")) return "bg-blue-100 text-blue-800"
    if (type.includes("van")) return "bg-purple-100 text-purple-800"
    return "bg-green-100 text-green-800"
  }

  const getFuelTypeColor = (fuelType: string) => {
    const fuel = fuelType.toLowerCase()
    if (fuel.includes("electric")) return "bg-green-100 text-green-800"
    if (fuel.includes("hybrid")) return "bg-blue-100 text-blue-800"
    if (fuel.includes("diesel")) return "bg-gray-100 text-gray-800"
    return "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="space-y-6">
      {/* VIN Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Identification
          </CardTitle>
          <CardDescription>Enter the 17-character VIN to automatically populate vehicle details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vin">VIN Number</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="vin"
                  value={vin}
                  onChange={(e) => handleVinChange(e.target.value)}
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                  className={`font-mono ${
                    vin.length > 0
                      ? isValid
                        ? "border-green-500 focus:border-green-500"
                        : "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {vin.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <Button onClick={handleVinDecode} disabled={!isValid || isLoading} variant="outline">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                Decode
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Characters: {vin.length}/17 {isValid && <span className="text-green-600">✓ Valid format</span>}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Details Section */}
      {vehicleSpecs && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>Automatically populated from VIN decode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={vehicleSpecs.year} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Make</Label>
                <Input value={vehicleSpecs.make} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={vehicleSpecs.model} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Trim</Label>
                <Input value={vehicleSpecs.trim} readOnly className="bg-gray-50" />
              </div>
            </div>

            <Separator />

            {/* Vehicle Characteristics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Vehicle Characteristics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Body Class</Label>
                  <Badge variant="outline" className="w-full justify-center">
                    {vehicleSpecs.bodyClass}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Vehicle Type</Label>
                  <Badge className={`w-full justify-center ${getVehicleTypeColor(vehicleSpecs.vehicleType)}`}>
                    {vehicleSpecs.vehicleType}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Doors</Label>
                  <Badge variant="outline" className="w-full justify-center">
                    {vehicleSpecs.doors}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Drive Type</Label>
                  <Badge variant="outline" className="w-full justify-center">
                    {vehicleSpecs.driveType}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Engine Specifications */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Engine Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cylinders</Label>
                  <Input value={vehicleSpecs.cylinders} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Displacement (L)</Label>
                  <Input value={vehicleSpecs.displacement.toFixed(1)} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Badge className={`w-full justify-center ${getFuelTypeColor(vehicleSpecs.fuelType)}`}>
                    {vehicleSpecs.fuelType}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Manufacturing & Weight */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Manufacturing & Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Plant Location</Label>
                  <Input
                    value={`${vehicleSpecs.plantCity}, ${vehicleSpecs.plantCountry}`}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GVWR (lbs)</Label>
                  <Input value={vehicleSpecs.gvwr.toLocaleString()} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Age</Label>
                  <Input
                    value={`${new Date().getFullYear() - vehicleSpecs.year} years`}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Factors */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Pricing Factors</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    +{Math.round(vehicleSpecs.ageFactor * 100)}%
                  </div>
                  <div className="text-xs text-blue-800">Age Factor</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    +{Math.round(vehicleSpecs.sizeFactor * 100)}%
                  </div>
                  <div className="text-xs text-green-800">Size Factor</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">
                    +{Math.round(vehicleSpecs.complexityFactor * 100)}%
                  </div>
                  <div className="text-xs text-orange-800">Complexity</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    +{Math.round(vehicleSpecs.specialtyFactor * 100)}%
                  </div>
                  <div className="text-xs text-purple-800">Specialty</div>
                </div>
              </div>
            </div>

            {/* Service Recommendations */}
            {showRecommendations && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Service Recommendations</h4>
                  <div className="space-y-2">
                    {getServiceRecommendations(vehicleSpecs).map((recommendation, index) => (
                      <Alert key={index}>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{recommendation}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
