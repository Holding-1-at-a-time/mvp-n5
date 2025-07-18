"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface EstimateItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: string
  type: "service" | "material" // Add type property
}

const initialEstimate: EstimateItem[] = [
  {
    id: "1",
    description: "Front Bumper Scratch Repair",
    quantity: 1,
    unitPrice: 150,
    total: 150,
    category: "Body Work",
    type: "service", // Assign type
  },
  {
    id: "2",
    description: "Door Dent Removal (PDR)",
    quantity: 1,
    unitPrice: 280,
    total: 280,
    category: "Dent Repair",
    type: "service", // Assign type
  },
  {
    id: "3",
    description: "Paint Touch-up & Blend",
    quantity: 1,
    unitPrice: 450,
    total: 450,
    category: "Paint Work",
    type: "service", // Assign type
  },
]

const serviceOptions = [
  { value: "scratch-repair", label: "Scratch Repair", price: 150, category: "Body Work", type: "service" },
  { value: "dent-removal", label: "Dent Removal (PDR)", price: 280, category: "Dent Repair", type: "service" },
  { value: "paint-touchup", label: "Paint Touch-up", price: 200, category: "Paint Work", type: "service" },
  { value: "bumper-repair", label: "Bumper Repair", price: 350, category: "Body Work", type: "service" },
  { value: "panel-replacement", label: "Panel Replacement", price: 800, category: "Body Work", type: "material" }, // Example material
  {
    value: "headlight-restoration",
    label: "Headlight Restoration",
    price: 120,
    category: "Detailing",
    type: "service",
  },
  { value: "interior-cleaning", label: "Interior Deep Clean", price: 180, category: "Detailing", type: "service" },
]

export default function EstimatePage() {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>(initialEstimate)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [editingItem, setEditingItem] = useState<string | null>(null)

  // Define separate tax rates
  const serviceTaxRate = 0.08 // 8% for services
  const materialTaxRate = 0.05 // 5% for materials

  // Calculate subtotals for each type
  const serviceSubtotal = estimateItems
    .filter((item) => item.type === "service")
    .reduce((sum, item) => sum + item.total, 0)
  const materialSubtotal = estimateItems
    .filter((item) => item.type === "material")
    .reduce((sum, item) => sum + item.total, 0)

  const totalSubtotal = serviceSubtotal + materialSubtotal
  const serviceTax = serviceSubtotal * serviceTaxRate
  const materialTax = materialSubtotal * materialTaxRate
  const totalTax = serviceTax + materialTax
  const grandTotal = totalSubtotal + totalTax

  const filteredServices = serviceOptions.filter((service) =>
    service.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addService = (serviceValue: string) => {
    const service = serviceOptions.find((s) => s.value === serviceValue)
    if (service) {
      const newItem: EstimateItem = {
        id: Date.now().toString(),
        description: service.label,
        quantity: 1,
        unitPrice: service.price,
        total: service.price,
        category: service.category,
        type: service.type, // Assign the type from serviceOptions
      }
      setEstimateItems([...estimateItems, newItem])
      setSelectedService("")
      setSearchTerm("")
    }
  }

  const updateItem = (id: string, field: keyof EstimateItem, value: number | string) => {
    setEstimateItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value } as EstimateItem // Cast to EstimateItem
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const removeItem = (id: string) => {
    setEstimateItems((items) => items.filter((item) => item.id !== id))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Body Work":
        return "bg-blue-100 text-blue-800"
      case "Dent Repair":
        return "bg-green-100 text-green-800"
      case "Paint Work":
        return "bg-purple-100 text-purple-800"
      case "Detailing":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
          <Badge variant="secondary" className="text-sm">
            Draft
          </Badge>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Add Services */}
        <div className="w-80 bg-white border-r p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Service Dropdown */}
              <Select value={selectedService} onValueChange={addService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{service.label}</div>
                          <div className="text-sm text-gray-500">{service.category}</div>
                        </div>
                        <div className="font-semibold">${service.price}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick Add Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Quick Add:</p>
                <div className="grid grid-cols-1 gap-2">
                  {serviceOptions.slice(0, 4).map((service) => (
                    <Button
                      key={service.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addService(service.value)}
                      className="justify-between"
                    >
                      <span className="text-xs">{service.label}</span>
                      <span className="text-xs font-semibold">${service.price}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Estimate Table */}
        <div className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b font-medium text-sm text-gray-600">
                <div className="col-span-5">Description</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-3 mt-4">
                {estimateItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100">
                    <div className="col-span-5">
                      {editingItem === item.id ? (
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          onBlur={() => setEditingItem(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingItem(null)}
                          className="text-sm"
                        />
                      ) : (
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <Badge className={`text-xs mt-1 ${getCategoryColor(item.category)}`}>{item.category}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        className="text-center text-sm"
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        className="text-right text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2 text-right font-semibold">${item.total.toFixed(2)}</div>
                    <div className="col-span-2 flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingItem(item.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {estimateItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No services added yet</p>
                  <p className="text-sm">Use the panel on the left to add services</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer - Totals and Actions */}
      <div className="bg-white border-t px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-sm">
              <span className="text-gray-600">Subtotal: </span>
              <span className="font-semibold">${totalSubtotal.toFixed(2)}</span>
            </div>
            {serviceTax > 0 && (
              <div className="text-sm">
                <span className="text-gray-600">Service Tax ({serviceTaxRate * 100}%): </span>
                <span className="font-semibold">${serviceTax.toFixed(2)}</span>
              </div>
            )}
            {materialTax > 0 && (
              <div className="text-sm">
                <span className="text-gray-600">Material Tax ({materialTaxRate * 100}%): </span>
                <span className="font-semibold">${materialTax.toFixed(2)}</span>
              </div>
            )}
            <div className="text-lg">
              <span className="text-gray-600">Total: </span>
              <span className="font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/assessment">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
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
