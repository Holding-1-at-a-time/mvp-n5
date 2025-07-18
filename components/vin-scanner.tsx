"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Camera, QrCode, XCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVinScanner } from "@/hooks/use-vin-scanner"

interface VinScannerProps {
  onVinScanned: (vin: string) => void
}

export function VinScanner({ onVinScanned }: VinScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { vin, scanning, error, startScan, stopScan } = useVinScanner(videoRef, canvasRef)
  const [manualVin, setManualVin] = useState("")

  useEffect(() => {
    if (vin) {
      onVinScanned(vin)
    }
  }, [vin, onVinScanned])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualVin.length === 17) {
      onVinScanned(manualVin.toUpperCase())
    } else {
      // Optionally show an error for invalid length
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          VIN Scanner
        </CardTitle>
        <p className="text-sm text-muted-foreground">Scan your vehicle's VIN using your camera or enter it manually.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
          {scanning && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
          {!scanning && !vin && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <Camera className="h-12 w-12" />
            </div>
          )}
          {vin && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 text-green-700 font-bold text-xl">
              VIN Scanned: {vin}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2">
          <Button onClick={startScan} disabled={scanning || !!vin} className="flex-1">
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Start Scan
              </>
            )}
          </Button>
          <Button onClick={stopScan} disabled={!scanning} variant="outline" className="flex-1 bg-transparent">
            Stop Scan
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {vin && (
          <Alert className="bg-green-50 border-green-200 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>VIN successfully scanned: {vin}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          <span className="px-2">OR</span>
          <span className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-2">
          <Label htmlFor="manual-vin">Enter VIN Manually</Label>
          <Input
            id="manual-vin"
            placeholder="Enter 17-character VIN"
            value={manualVin}
            onChange={(e) => setManualVin(e.target.value.toUpperCase())}
            maxLength={17}
            minLength={17}
          />
          <Button type="submit" className="w-full" disabled={manualVin.length !== 17}>
            Submit Manual VIN
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
