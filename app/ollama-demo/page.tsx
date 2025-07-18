"use client"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useOllamaAssessment } from "@/hooks/use-ollama-assessment"
import { Loader2, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function OllamaDemoPage() {
  const [imageUrl, setImageUrl] = useState("")
  const [vinNumber, setVinNumber] = useState("1HGBH41JXMN109186") // Default VIN
  const { assess, result, loading, error } = useOllamaAssessment()

  const handleAssess = () => {
    if (imageUrl && vinNumber) {
      assess({ imageUrls: [imageUrl], vinNumber })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ollama AI Vehicle Assessment Demo
            </CardTitle>
            <p className="text-sm text-muted-foreground">Test the AI damage detection and assessment using Ollama.</p>
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
              <p className="text-xs text-muted-foreground">
                Provide a direct URL to an image of a vehicle with damage.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin-number">VIN Number</Label>
              <Input
                id="vin-number"
                placeholder="Enter VIN"
                value={vinNumber}
                onChange={(e) => setVinNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">A valid VIN helps the AI understand the vehicle context.</p>
            </div>
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
    </div>
  )
}
