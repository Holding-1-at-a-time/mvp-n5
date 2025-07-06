"use client"

import { useState } from "react"
import { Scan, X, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVinScanner } from "@/hooks/use-vin-scanner"
import { decodeVin, validateVin, formatVin, type VehicleInfo } from "@/lib/vin-decoder"
import { toast } from "sonner"

interface VinScannerProps {
  onVehicleDetected: (vin: string, vehicle: VehicleInfo) => void
  initialVin?: string
}

export function VinScanner({ onVehicleDetected, initialVin = "" }: VinScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isDecoding, setIsDecoding] = useState(false)
  const [manualVin, setManualVin] = useState(initialVin)
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null)
  const [error, setError] = useState<string>("")
  const [currentVin, setCurrentVin] = useState(initialVin)

  const handleVinDetected = async (vin: string) => {
    setCurrentVin(vin)
    setIsScanning(false)
    setIsDecoding(true)
    setError("")

    try {
      const vehicleInfo = await decodeVin(vin)
      setVehicle(vehicleInfo)
      onVehicleDetected(vin, vehicleInfo)
      toast.success("Vehicle information retrieved successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decode VIN"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsDecoding(false)
    }
  }

  const handleManualSubmit = async () => {
    const formattedVin = formatVin(manualVin)

    if (!validateVin(formattedVin)) {
      setError("Please enter a valid 17-character VIN")
      return
    }

    await handleVinDetected(formattedVin)
  }

  const startScanning = () => {
    setIsScanning(true)
    setError("")
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  const reset = () => {
    setCurrentVin("")
    setVehicle(null)
    setError("")
    setManualVin("")
  }

  const { videoRef, error: scannerError } = useVinScanner({
    onDetected: handleVinDetected,
    isActive: isScanning,
  })

  // Show vehicle info if successfully decoded
  if (vehicle && currentVin) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Vehicle Identified</h3>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <X className="w-4 h-4 mr-2" />
              Change
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-600">VIN</Label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">{currentVin}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Make</Label>
                <p className="font-medium">{vehicle.make}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Model</Label>
                <p className="font-medium">{vehicle.model}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Year</Label>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Trim</Label>
                <p className="font-medium">{vehicle.trim}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{vehicle.bodyClass}</Badge>
                <Badge variant="secondary">{vehicle.fuelType}</Badge>
                <Badge variant="secondary">{vehicle.driveType}</Badge>
                <Badge variant="secondary">{vehicle.transmission}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show scanner interface
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Scan or Enter VIN</h3>
            <p className="text-sm text-gray-600">Use the camera to scan a VIN barcode or enter it manually</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scannerError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{scannerError}</AlertDescription>
            </Alert>
          )}

          {/* Camera Scanner */}
          {isScanning ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                    Position VIN barcode within the frame
                  </p>
                </div>
              </div>
              <Button onClick={stopScanning} variant="outline" className="w-full bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={startScanning} className="w-full" size="lg">
                <Scan className="w-5 h-5 mr-2" />
                Scan VIN Barcode
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or enter manually</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-vin">VIN Number</Label>
                <Input
                  id="manual-vin"
                  placeholder="Enter 17-character VIN"
                  value={manualVin}
                  onChange={(e) => setManualVin(e.target.value.toUpperCase())}
                  maxLength={17}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">VIN must be exactly 17 characters (letters and numbers)</p>
              </div>

              <Button
                onClick={handleManualSubmit}
                disabled={isDecoding || manualVin.length !== 17}
                className="w-full"
                size="lg"
              >
                {isDecoding ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Decoding VIN...
                  </div>
                ) : (
                  "Decode VIN"
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
