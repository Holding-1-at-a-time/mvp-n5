"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface VinFormProps {
  onVinDecoded: (vin: string, specs: any) => void
}

export function VinForm({ onVinDecoded }: VinFormProps) {
  const [vin, setVin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decodedSpecs, setDecodedSpecs] = useState<any>(null)

  const decodeVin = useMutation(api.vinDecoder.decodeVin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDecodedSpecs(null)
    setLoading(true)

    try {
      const result = await decodeVin({ vin })
      if (result) {
        setDecodedSpecs(result)
        onVinDecoded(vin, result)
      } else {
        setError("VIN could not be decoded. Please check the VIN and try again.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during VIN decoding.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decode VIN</CardTitle>
        <p className="text-sm text-muted-foreground">Enter a 17-character VIN to get vehicle specifications.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vin">VIN Number</Label>
            <Input
              id="vin"
              placeholder="Enter 17-character VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              maxLength={17}
              minLength={17}
              required
            />
          </div>
          <Button type="submit" disabled={loading || vin.length !== 17}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Decoding..." : "Decode VIN"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {decodedSpecs && (
          <Alert className="bg-green-50 border-green-200 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>VIN decoded successfully!</AlertDescription>
            <div className="mt-2 text-sm">
              <p>
                <strong>Make:</strong> {decodedSpecs.Make}
              </p>
              <p>
                <strong>Model:</strong> {decodedSpecs.Model}
              </p>
              <p>
                <strong>Year:</strong> {decodedSpecs.ModelYear}
              </p>
              <p>
                <strong>Body Class:</strong> {decodedSpecs.BodyClass}
              </p>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
