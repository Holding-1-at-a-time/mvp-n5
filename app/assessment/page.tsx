"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, MapPin } from "lucide-react"
import Link from "next/link"

interface DamageItem {
  id: string
  type: string
  severity: "Low" | "Medium" | "High"
  location: string
  description: string
  estimatedCost: number
  photo?: string
  position: { x: number; y: number }
}

const mockDamageData: DamageItem[] = [
  {
    id: "A1",
    type: "Scratch",
    severity: "Low",
    location: "Front Bumper",
    description: "Surface scratch on front bumper, left side",
    estimatedCost: 150,
    photo: "/placeholder.svg?height=80&width=80&text=Scratch",
    position: { x: 45, y: 75 },
  },
  {
    id: "B2",
    type: "Dent",
    severity: "Medium",
    location: "Driver Door",
    description: "Small dent on driver side door panel",
    estimatedCost: 280,
    photo: "/placeholder.svg?height=80&width=80&text=Dent",
    position: { x: 25, y: 45 },
  },
  {
    id: "C3",
    type: "Paint Damage",
    severity: "High",
    location: "Rear Quarter Panel",
    description: "Deep paint damage with primer showing",
    estimatedCost: 450,
    photo: "/placeholder.svg?height=80&width=80&text=Paint",
    position: { x: 20, y: 25 },
  },
]

export default function AssessmentPage() {
  const [selectedDamage, setSelectedDamage] = useState<DamageItem | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const totalEstimate = mockDamageData.reduce((sum, item) => sum + item.estimatedCost, 0)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-yellow-500"
      case "Medium":
        return "bg-orange-500"
      case "High":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/upload">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Assessment Results</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Link href="/estimate">
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Estimate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Vehicle Map View */}
        <div className="flex-1 relative bg-white">
          {/* Vehicle Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full max-w-2xl">
              {/* Car silhouette placeholder */}
              <div className="relative bg-gray-200 rounded-lg" style={{ aspectRatio: "2/1" }}>
                <svg viewBox="0 0 400 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Simple car silhouette */}
                  <path
                    d="M50 150 L50 120 Q50 100 70 100 L100 100 Q110 80 130 80 L270 80 Q290 80 300 100 L330 100 Q350 100 350 120 L350 150 L320 150 Q320 170 300 170 Q280 170 280 150 L120 150 Q120 170 100 170 Q80 170 80 150 Z"
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                  {/* Windows */}
                  <path
                    d="M120 100 L120 85 Q120 80 125 80 L275 80 Q280 80 280 85 L280 100 Z"
                    fill="#f3f4f6"
                    stroke="#9ca3af"
                  />
                </svg>

                {/* Damage Hotspots */}
                {mockDamageData.map((damage) => (
                  <button
                    key={damage.id}
                    className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform ${getSeverityColor(damage.severity)}`}
                    style={{
                      left: `${damage.position.x}%`,
                      top: `${damage.position.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setSelectedDamage(damage)}
                  >
                    <span className="text-white text-xs font-bold">{damage.id}</span>
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Low Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Medium Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm">High Severity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Damage Detail Tooltip */}
          {selectedDamage && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 border">
              <div className="flex items-start gap-3">
                <img
                  src={selectedDamage.photo || "/placeholder.svg"}
                  alt={selectedDamage.type}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {selectedDamage.type} {selectedDamage.id}
                    </h3>
                    <Badge
                      variant={
                        selectedDamage.severity === "Low"
                          ? "secondary"
                          : selectedDamage.severity === "Medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {selectedDamage.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{selectedDamage.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{selectedDamage.location}</span>
                  </div>
                  <div className="mt-2 font-semibold text-lg">${selectedDamage.estimatedCost}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDamage(null)}>
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className={`bg-white border-l transition-all duration-300 ${sidebarCollapsed ? "w-12" : "w-80"}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && <h2 className="font-semibold">Detected Damage</h2>}
              <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? "→" : "←"}
              </Button>
            </div>

            {!sidebarCollapsed && (
              <div className="space-y-3">
                {mockDamageData.map((damage) => (
                  <Card
                    key={damage.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedDamage?.id === damage.id ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => setSelectedDamage(damage)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={damage.photo || "/placeholder.svg"}
                          alt={damage.type}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {damage.type} {damage.id}
                            </span>
                            <Badge
                              variant={
                                damage.severity === "Low"
                                  ? "secondary"
                                  : damage.severity === "Medium"
                                    ? "default"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {damage.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{damage.location}</p>
                          <div className="font-semibold text-sm">${damage.estimatedCost}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Summary */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Total Estimate</div>
                      <div className="text-2xl font-bold text-blue-600">${totalEstimate}</div>
                      <div className="text-xs text-gray-500 mt-1">{mockDamageData.length} issues detected</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            AI Assessment Complete • {mockDamageData.length} issues found • Est. ${totalEstimate}
          </div>
          <div className="flex gap-2">
            <Link href="/estimate">
              <Button variant="outline">Edit Estimate</Button>
            </Link>
            <Link href="/schedule">
              <Button>
                Approve & Schedule
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
