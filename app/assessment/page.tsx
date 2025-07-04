"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Download, ChevronRight } from "lucide-react"
import Link from "next/link"

interface DamageItem {
  id: string
  label: string
  severity: "Low" | "Medium" | "High"
  position: { x: number; y: number }
  photo: string
  description: string
}

export default function AssessmentPage() {
  const [selectedDamage, setSelectedDamage] = useState<DamageItem | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const damageItems: DamageItem[] = [
    {
      id: "A1",
      label: "Scratch A1",
      severity: "Low",
      position: { x: 25, y: 30 },
      photo: "/placeholder.svg?height=80&width=80&text=Scratch",
      description: "Minor surface scratch on front bumper",
    },
    {
      id: "B2",
      label: "Dent B2",
      severity: "Medium",
      position: { x: 70, y: 45 },
      photo: "/placeholder.svg?height=80&width=80&text=Dent",
      description: "Small dent on passenger door",
    },
    {
      id: "C3",
      label: "Paint Chip C3",
      severity: "Low",
      position: { x: 45, y: 60 },
      photo: "/placeholder.svg?height=80&width=80&text=Chip",
      description: "Paint chip on hood edge",
    },
  ]

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
              <Edit className="h-4 w-4 mr-2" />
              Edit Estimate
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Vehicle Map */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Vehicle Damage Map</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="relative w-full h-full max-w-2xl mx-auto">
                {/* Vehicle Silhouette */}
                <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=400&width=600&text=Vehicle+Silhouette"
                    alt="Vehicle silhouette"
                    className="w-full h-full object-contain"
                  />

                  {/* Damage Hotspots */}
                  {damageItems.map((damage) => (
                    <button
                      key={damage.id}
                      className={`absolute w-6 h-6 rounded-full ${getSeverityColor(damage.severity)} 
                        border-2 border-white shadow-lg hover:scale-110 transition-transform
                        flex items-center justify-center text-white text-xs font-bold`}
                      style={{
                        left: `${damage.position.x}%`,
                        top: `${damage.position.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => setSelectedDamage(damage)}
                    >
                      {damage.id}
                    </button>
                  ))}
                </div>

                {/* Damage Tooltip */}
                {selectedDamage && (
                  <Card className="absolute top-4 right-4 w-64 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={selectedDamage.photo || "/placeholder.svg"}
                          alt={selectedDamage.label}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{selectedDamage.label}</h3>
                          <Badge
                            variant="secondary"
                            className={`${getSeverityColor(selectedDamage.severity)} text-white mb-2`}
                          >
                            {selectedDamage.severity}
                          </Badge>
                          <p className="text-sm text-gray-600">{selectedDamage.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setSelectedDamage(null)}
                      >
                        ×
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? "w-12" : "w-80"} transition-all duration-300 border-l bg-white`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && <h2 className="font-semibold">Detected Issues</h2>}
              <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <ChevronRight className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
              </Button>
            </div>

            {!sidebarCollapsed && (
              <div className="space-y-3">
                {damageItems.map((damage) => (
                  <Card
                    key={damage.id}
                    className={`cursor-pointer transition-colors ${
                      selectedDamage?.id === damage.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedDamage(damage)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${getSeverityColor(damage.severity)} 
                          flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {damage.id}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{damage.label}</h3>
                          <Badge
                            variant="secondary"
                            className={`${getSeverityColor(damage.severity)} text-white text-xs`}
                          >
                            {damage.severity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-4 max-w-6xl mx-auto">
          <Link href="/estimate" className="flex-1">
            <Button size="lg" className="w-full">
              Approve & Schedule
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Edit Estimate
          </Button>
        </div>
      </div>
    </div>
  )
}
