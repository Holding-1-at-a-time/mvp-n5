"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface ServiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function EstimatePage() {
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "1",
      description: "Scratch Buffing",
      quantity: 1,
      unitPrice: 50,
      total: 50,
    },
    {
      id: "2",
      description: "Leather Care Treatment",
      quantity: 1,
      unitPrice: 30,
      total: 30,
    },
    {
      id: "3",
      description: "Paint Touch-up",
      quantity: 1,
      unitPrice: 75,
      total: 75,
    },
  ])

  const [newService, setNewService] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const subtotal = services.reduce((sum, service) => sum + service.total, 0)
  const taxRate = 0.08
  const tax = subtotal * taxRate
  const grandTotal = subtotal + tax

  const updateService = (id: string, field: keyof ServiceItem, value: number | string) => {
    setServices((prev) =>
      prev.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return service
      }),
    )
  }

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((service) => service.id !== id))
  }

  const addService = () => {
    if (newService.trim()) {
      const newItem: ServiceItem = {
        id: Date.now().toString(),
        description: newService,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      }
      setServices((prev) => [...prev, newItem])
      setNewService("")
    }
  }

  const commonServices = [
    "Scratch Repair",
    "Dent Removal",
    "Paint Touch-up",
    "Bumper Repair",
    "Headlight Restoration",
    "Interior Cleaning",
    "Leather Repair",
    "Windshield Replacement",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/assessment">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Edit Estimate</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Add Service Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={newService} onValueChange={setNewService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or search for a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addService} disabled={!newService}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Service Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-center py-3 px-2 w-20">Qty</th>
                    <th className="text-center py-3 px-2 w-24">Unit $</th>
                    <th className="text-center py-3 px-2 w-24">Total $</th>
                    <th className="text-center py-3 px-2 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="py-3 px-2">
                        {editingId === service.id ? (
                          <Input
                            value={service.description}
                            onChange={(e) => updateService(service.id, "description", e.target.value)}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => setEditingId(service.id)}
                          >
                            {service.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Input
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateService(service.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                          min="1"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Input
                          type="number"
                          value={service.unitPrice}
                          onChange={(e) =>
                            updateService(service.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-3 px-2 text-center font-medium">${service.total.toFixed(2)}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(service.id)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteService(service.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/assessment">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
          <Link href="/schedule" className="flex-1">
            <Button size="lg" className="w-full">
              Approve & Schedule
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
