"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useOllamaAssessment } from "@/hooks/use-ollama-assessment"
import { Camera, Upload, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface OllamaDamageDetectorProps {
  onAssessmentComplete?: (assessment: any) => void
}

export function OllamaDamageDetector({ onAssessmentComplete }: OllamaDamageDetectorProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [vinNumber, setVinNumber] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")

  const {
    assessDamage,
    checkHealth,
    isLoading,
    lastAssessment,
    error,
    damageCount,
    totalEstimate,
    confidence,
    processingTime,
    reset,
  } = useOllamaAssessment()

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleAssess = async () => {
    if (imageUrls.length === 0 || !vinNumber) {
      return
    }

    try {
      const assessment = await assessDamage({
        imageUrls,
        vinNumber,
        metadata: {
          inspectionId: `demo_${Date.now()}`,
          timestamp: Date.now(),
        },
      })

      onAssessmentComplete?.(assessment)
    } catch (err) {
      // Error is already handled by the hook
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-yellow-100 text-yellow-800"
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDamageTypeIcon = (type: string) => {
    switch (type) {
      case "dent":
        return "🔨"
      case "scratch":
        return "✂️"
      case "crack":
        return "💥"
      case "rust":
        return "🦠"
      case "paint_damage":
        return "🎨"
      case "glass_damage":
        return "🪟"
      default:
        return "⚠️"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Ollama AI Damage Detection
          </CardTitle>
          <CardDescription>
            Upload vehicle images and VIN for AI-powered damage assessment using Ollama Vision models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* VIN Input */}
          <div className="space-y-2">
            <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
            <Input
              id="vin"
              placeholder="Enter 17-character VIN"
              value={vinNumber}
              onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
              maxLength={17}
              className="font-mono"
            />
            {vinNumber && vinNumber.length !== 17 && (
              <p className="text-sm text-red-600">VIN must be exactly 17 characters</p>
            )}
          </div>

          {/* Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="image-url">Vehicle Image URLs</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                placeholder="https://example.com/vehicle-image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddImage()}
              />
              <Button onClick={handleAddImage} disabled={!newImageUrl}>
                <Upload className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Image List */}
          {imageUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Added Images ({imageUrls.length})</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate flex-1">{url}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAssess}
              disabled={isLoading || imageUrls.length === 0 || vinNumber.length !== 17}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Assess Damage
                </>
              )}
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>

          {/* Loading Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing with Ollama...</span>
                <span className="text-muted-foreground">This may take a few moments</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {lastAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Assessment Results
              </span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {processingTime}ms
              </Badge>
            </CardTitle>
            <CardDescription>
              VIN: {lastAssessment.vinNumber} • Model: {lastAssessment.metadata.modelVersion}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{damageCount}</div>
                <div className="text-sm text-blue-800">Damages Found</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(confidence * 100)}%</div>
                <div className="text-sm text-green-800">Confidence</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">${totalEstimate.toLocaleString()}</div>
                <div className="text-sm text-purple-800">Est. Repair Cost</div>
              </div>
            </div>

            <Separator />

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vision Processing:</span>
                <span className="font-mono">{lastAssessment.metadata.ollamaLatency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Embedding Generation:</span>
                <span className="font-mono">{lastAssessment.metadata.embeddingLatency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images Processed:</span>
                <span className="font-mono">{lastAssessment.metadata.imageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Embeddings Generated:</span>
                <span className="font-mono">{lastAssessment.embeddings.length}</span>
              </div>
            </div>

            {/* Damage Details */}
            {lastAssessment.damages.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold">Detected Damages</h4>
                  {lastAssessment.damages.map((damage, index) => (
                    <div key={damage.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getDamageTypeIcon(damage.type)}</span>
                          <span className="font-medium capitalize">{damage.type.replace("_", " ")}</span>
                          <Badge className={getSeverityColor(damage.severity)}>{damage.severity}</Badge>
                        </div>
                        <Badge variant="outline">{Math.round(damage.confidence * 100)}% confidence</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{damage.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Location: {damage.location}</span>
                        <span>
                          Bounding Box: [{damage.boundingBox.x}, {damage.boundingBox.y}, {damage.boundingBox.width},{" "}
                          {damage.boundingBox.height}]
                        </span>
                      </div>
                      {damage.embedding && (
                        <div className="text-xs text-muted-foreground">
                          Embedding: {damage.embedding.length} dimensions
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {lastAssessment.damages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No damage detected in the provided images.</p>
                <p className="text-sm">The vehicle appears to be in good condition.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
