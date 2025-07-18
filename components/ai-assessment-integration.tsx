"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AssessmentResult {
  damage: Array<{
    type: string
    location: string
    severity: "low" | "medium" | "high"
    description: string
    estimatedRepairCost: number
    confidence?: number
  }>
  overallCondition: "excellent" | "good" | "fair" | "poor"
  recommendations: string[]
  totalEstimatedCost: number
  vinDecodedSpecs?: Record<string, any>
}

interface AIAssessmentIntegrationProps {
  apiEndpoint: string // e.g., "/api/ai/v1/assess" or "/api/ai/v2/assess"
  showVinDecodedSpecs?: boolean
}

export function AIAssessmentIntegration({ apiEndpoint, showVinDecodedSpecs = false }: AIAssessmentIntegrationProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [vinNumber, setVinNumber] = useState("1HGBH41JXMN109186") // Default VIN
  const [vinDecodedSpecs, setVinDecodedSpecs] = useState<Record<string, any> | null>(null)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssess = async () => {
    if (!imageUrl || !vinNumber) {
      setError("Please provide an image URL and VIN number.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload: { imageUrls: string[]; vinNumber: string; vinDecodedSpecs?: Record<string, any> } = {
        imageUrls: [imageUrl],
        vinNumber,
      }

      if (showVinDecodedSpecs && vinDecodedSpecs) {
        payload.vinDecodedSpecs = vinDecodedSpecs
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: AssessmentResult = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during assessment.")
    } finally {
      setLoading(false)
    }
  }

  const handleDecodeVin = async () => {
    if (!vinNumber) {
      setError("Please enter a VIN to decode.")
      return
    }
    setLoading(true)
    setError(null)
    setVinDecodedSpecs(null)
    try {
      const response = await fetch(`/api/vin/decode?vin=${vinNumber}`) // Assuming a VIN decode API route
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to decode VIN! status: ${response.status}`)
      }
      const data = await response.json()
      setVinDecodedSpecs(data)
    } catch (err: any) {
      setError(err.message || "Failed to decode VIN.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Vehicle Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Integrate and test your AI assessment API endpoint: `{apiEndpoint}`
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              placeholder="e.g., https://example.com/car-damage.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Provide a direct URL to an image of a vehicle with damage.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin-number">VIN Number</Label>
            <div className="flex gap-2">
              <Input
                id="vin-number"
                placeholder="Enter VIN"
                value={vinNumber}
                onChange={(e) => setVinNumber(e.target.value)}
              />
              {showVinDecodedSpecs && (
                <Button onClick={handleDecodeVin} disabled={loading || !vinNumber}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Decode VIN
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">A valid VIN helps the AI understand the vehicle context.</p>
          </div>

          {showVinDecodedSpecs && vinDecodedSpecs && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Decoded VIN Specs:</h3>
              <ScrollArea className="h-[150px] w-full rounded-md border p-2 text-xs bg-gray-50">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(vinDecodedSpecs, null, 2)}</pre>
              </ScrollArea>
            </div>
          )}

          <Button onClick={handleAssess} disabled={loading || !imageUrl || !vinNumber}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Assessing..." : "Run AI Assessment"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {imageUrl && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Input Image:</h3>
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Vehicle for assessment"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Overall Condition:</h3>
              <Badge
                variant={
                  result.overallCondition === "excellent"
                    ? "default"
                    : result.overallCondition === "good"
                      ? "secondary"
                      : result.overallCondition === "fair"
                        ? "outline"
                        : "destructive"
                }
                className="capitalize text-base"
              >
                {result.overallCondition}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Detected Damages ({result.damage.length}):</h3>
              {result.damage.length > 0 ? (
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {result.damage.map((d, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{d.type}</span>
                          <Badge
                            variant={
                              d.severity === "low" ? "secondary" : d.severity === "medium" ? "default" : "destructive"
                            }
                            className="capitalize"
                          >
                            {d.severity}
                          </Badge>
                          {d.confidence && (
                            <Badge variant="outline" className="text-xs">
                              Confidence: {(d.confidence * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Location: {d.location}</p>
                        <p className="text-sm text-muted-foreground">Description: {d.description}</p>
                        <p className="text-sm font-semibold mt-1">Estimated Cost: ${d.estimatedRepairCost}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No significant damage detected.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Total Estimated Cost:</h3>
              <p className="text-2xl font-bold text-blue-600">${result.totalEstimatedCost}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Recommendations:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
