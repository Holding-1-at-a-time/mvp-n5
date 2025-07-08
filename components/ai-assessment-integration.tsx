"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Brain, Camera, CheckCircle, AlertTriangle, Zap, Target, TrendingUp, Clock, DollarSign } from "lucide-react"
import type { SlickVehicleSpecs } from "@/lib/vin-decoder"
import type { DamageMetrics } from "@/lib/pricing-engine"

interface AIAssessmentIntegrationProps {
  vehicleSpecs: SlickVehicleSpecs
  imageUrls: string[]
  onAssessmentComplete?: (damages: DamageMetrics, confidence: number) => void
}

interface DamageDetection {
  id: string
  type: string
  severity: "minor" | "moderate" | "severe"
  location: string
  confidence: number
  description: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  estimatedArea: number // in square meters
  vehicleSpecificFactors: {
    paintType: string
    materialComplexity: number
    accessibilityFactor: number
  }
}

export function AIAssessmentIntegration({
  vehicleSpecs,
  imageUrls,
  onAssessmentComplete,
}: AIAssessmentIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [damages, setDamages] = useState<DamageDetection[]>([])
  const [overallConfidence, setOverallConfidence] = useState(0)
  const [processingTime, setProcessingTime] = useState(0)

  const startAssessment = async () => {
    setIsProcessing(true)
    setProgress(0)
    setDamages([])
    const startTime = Date.now()

    try {
      // Step 1: Initialize AI with vehicle specifications
      setCurrentStep("Initializing AI with vehicle specifications...")
      setProgress(10)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 2: Preprocess images based on vehicle type
      setCurrentStep("Preprocessing images for vehicle analysis...")
      setProgress(25)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 3: Apply vehicle-specific detection models
      setCurrentStep("Applying vehicle-specific damage detection...")
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 4: Analyze damages with vehicle context
      setCurrentStep("Analyzing damages with vehicle specifications...")
      setProgress(75)
      const detectedDamages = await simulateVehicleSpecificDamageDetection(vehicleSpecs, imageUrls)
      setDamages(detectedDamages)

      // Step 5: Calculate confidence and finalize
      setCurrentStep("Finalizing assessment with confidence scoring...")
      setProgress(90)
      const confidence = calculateOverallConfidence(detectedDamages, vehicleSpecs)
      setOverallConfidence(confidence)

      setProgress(100)
      setCurrentStep("Assessment complete!")

      // Convert to DamageMetrics format
      const damageMetrics: DamageMetrics = {
        count: detectedDamages.length,
        averageSeverity: calculateAverageSeverity(detectedDamages),
        totalArea: detectedDamages.reduce((sum, d) => sum + d.estimatedArea, 0),
        types: [...new Set(detectedDamages.map((d) => d.type))],
        locations: [...new Set(detectedDamages.map((d) => d.location))],
      }

      onAssessmentComplete?.(damageMetrics, confidence)
    } catch (error) {
      console.error("AI Assessment failed:", error)
      setCurrentStep("Assessment failed")
    } finally {
      setProcessingTime(Date.now() - startTime)
      setIsProcessing(false)
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* AI Assessment Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Damage Assessment
          </CardTitle>
          <CardDescription>
            Vehicle-specific AI analysis using {vehicleSpecs.year} {vehicleSpecs.make} {vehicleSpecs.model}{" "}
            specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehicle Context Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Body Class</div>
              <div className="font-semibold">{vehicleSpecs.bodyClass}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Fuel Type</div>
              <div className="font-semibold">{vehicleSpecs.fuelType}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Paint Complexity</div>
              <div className="font-semibold">
                {vehicleSpecs.specialtyFactor > 0.2
                  ? "High"
                  : vehicleSpecs.specialtyFactor > 0.1
                    ? "Medium"
                    : "Standard"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Images</div>
              <div className="font-semibold">{imageUrls.length}</div>
            </div>
          </div>

          {/* Assessment Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Ready to analyze {imageUrls.length} images</span>
            </div>
            <Button onClick={startAssessment} disabled={isProcessing || imageUrls.length === 0}>
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start AI Assessment
                </>
              )}
            </Button>
          </div>

          {/* Progress Display */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results Summary */}
          {damages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{damages.length}</div>
                <div className="text-xs text-blue-800">Damages Found</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(overallConfidence)}`}>
                  {Math.round(overallConfidence * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {damages.reduce((sum, d) => sum + d.estimatedArea, 0).toFixed(1)}m²
                </div>
                <div className="text-xs text-green-800">Total Area</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{(processingTime / 1000).toFixed(1)}s</div>
                <div className="text-xs text-orange-800">Processing Time</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle-Specific AI Insights */}
      {damages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Vehicle-Specific Analysis
            </CardTitle>
            <CardDescription>
              AI recommendations based on {vehicleSpecs.make} {vehicleSpecs.model} specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vehicle-Specific Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Paint System:</strong>{" "}
                  {vehicleSpecs.fuelType.includes("Electric")
                    ? "EV-specific coatings detected"
                    : "Standard automotive paint"}
                </AlertDescription>
              </Alert>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Body Complexity:</strong> {vehicleSpecs.bodyClass} requires{" "}
                  {vehicleSpecs.sizeFactor > 0.2 ? "specialized" : "standard"} approach
                </AlertDescription>
              </Alert>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Age Factor:</strong> {new Date().getFullYear() - vehicleSpecs.year} year old vehicle -{" "}
                  {vehicleSpecs.ageFactor > 0.15 ? "restoration" : "maintenance"} focus
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Damage Analysis with Vehicle Context */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Detected Damages with Vehicle-Specific Context
              </h4>

              {damages.map((damage) => (
                <Card key={damage.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold">{damage.type}</div>
                        <div className="text-sm text-muted-foreground">{damage.location}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSeverityColor(damage.severity)}>{damage.severity}</Badge>
                        <Badge variant="outline">{Math.round(damage.confidence * 100)}% confident</Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{damage.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Estimated Area:</span> {damage.estimatedArea.toFixed(2)}m²
                      </div>
                      <div>
                        <span className="font-medium">Material:</span> {damage.vehicleSpecificFactors.paintType}
                      </div>
                      <div>
                        <span className="font-medium">Complexity:</span>{" "}
                        {damage.vehicleSpecificFactors.materialComplexity > 0.7 ? "High" : "Standard"}
                      </div>
                    </div>

                    {/* Vehicle-Specific Recommendations */}
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <div className="text-sm font-medium text-blue-900 mb-1">Vehicle-Specific Recommendations:</div>
                      <div className="text-sm text-blue-800">
                        {vehicleSpecs.fuelType.includes("Electric") && "Use EV-safe cleaning products. "}
                        {vehicleSpecs.trim.toLowerCase().includes("leather") && "Leather conditioning recommended. "}
                        {vehicleSpecs.bodyClass.includes("Convertible") && "Soft-top protection required. "}
                        {damage.severity === "severe" &&
                          vehicleSpecs.ageFactor > 0.15 &&
                          "Consider restoration package for older vehicle. "}
                        Based on {vehicleSpecs.make} specifications, use{" "}
                        {damage.vehicleSpecificFactors.paintType.toLowerCase()} compatible materials.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Performance Metrics */}
      {damages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              AI Performance Metrics
            </CardTitle>
            <CardDescription>Assessment quality and processing statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-green-600">{(processingTime / 1000).toFixed(1)}s</div>
                <div className="text-xs text-green-800">Processing Time</div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-blue-600">{Math.round(overallConfidence * 100)}%</div>
                <div className="text-xs text-blue-800">Overall Confidence</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-purple-600">{damages.length}</div>
                <div className="text-xs text-purple-800">Detections</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-orange-600">
                  +{Math.round(calculateAverageSeverity(damages) * 100)}%
                </div>
                <div className="text-xs text-orange-800">Pricing Impact</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Simulation functions for demo purposes
async function simulateVehicleSpecificDamageDetection(
  vehicleSpecs: SlickVehicleSpecs,
  imageUrls: string[],
): Promise<DamageDetection[]> {
  // Simulate AI processing with vehicle-specific logic
  const damages: DamageDetection[] = []

  // Generate realistic damages based on vehicle characteristics
  const damageTypes = ["scratch", "dent", "paint_chip", "rust_spot", "stain"]
  const locations = ["front_bumper", "rear_bumper", "driver_door", "passenger_door", "hood", "trunk"]

  const numDamages = Math.floor(Math.random() * 5) + 1 // 1-5 damages

  for (let i = 0; i < numDamages; i++) {
    const damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]

    // Vehicle-specific factors
    const paintType = vehicleSpecs.fuelType.includes("Electric")
      ? "EV-specific coating"
      : vehicleSpecs.specialtyFactor > 0.2
        ? "Premium paint system"
        : "Standard automotive paint"

    const materialComplexity = vehicleSpecs.specialtyFactor + (vehicleSpecs.ageFactor > 0.15 ? 0.2 : 0)

    damages.push({
      id: `damage_${i}`,
      type: damageType,
      severity: ["minor", "moderate", "severe"][Math.floor(Math.random() * 3)] as "minor" | "moderate" | "severe",
      location,
      confidence: 0.7 + Math.random() * 0.3, // 70-100% confidence
      description: `${damageType.replace("_", " ")} detected on ${location.replace("_", " ")} with ${Math.round(
        (0.7 + Math.random() * 0.3) * 100,
      )}% confidence`,
      boundingBox: {
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 50 + Math.random() * 100,
        height: 50 + Math.random() * 100,
      },
      estimatedArea: 0.01 + Math.random() * 0.1, // 0.01-0.11 m²
      vehicleSpecificFactors: {
        paintType,
        materialComplexity,
        accessibilityFactor: location.includes("bumper") ? 0.8 : 0.9,
      },
    })
  }

  return damages
}

function calculateOverallConfidence(damages: DamageDetection[], vehicleSpecs: SlickVehicleSpecs): number {
  if (damages.length === 0) return 0

  const avgConfidence = damages.reduce((sum, d) => sum + d.confidence, 0) / damages.length

  // Boost confidence for vehicles with clear specifications
  let specBoost = 0
  if (vehicleSpecs.make !== "Unknown") specBoost += 0.05
  if (vehicleSpecs.model !== "Unknown") specBoost += 0.05
  if (vehicleSpecs.year > 2000) specBoost += 0.05

  return Math.min(avgConfidence + specBoost, 1.0)
}

function calculateAverageSeverity(damages: DamageDetection[]): number {
  if (damages.length === 0) return 0

  const severityMap = { minor: 0.3, moderate: 0.6, severe: 1.0 }
  const totalSeverity = damages.reduce((sum, d) => sum + severityMap[d.severity], 0)

  return totalSeverity / damages.length
}
