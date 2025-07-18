"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Mail, Phone, MapPin, Calendar, Clock, CreditCard } from "lucide-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: "service" | "material" | "labor" | "parts" // Expanded types
}

const invoiceItems: InvoiceItem[] = [
  {
    description: "Front Bumper Scratch Repair",
    quantity: 1,
    unitPrice: 150.0,
    total: 150.0,
    type: "service",
  },
  {
    description: "Door Dent Removal (PDR)",
    quantity: 1,
    unitPrice: 280.0,
    total: 280.0,
    type: "service",
  },
  {
    description: "Paint Touch-up & Blend",
    quantity: 1,
    unitPrice: 450.0,
    total: 450.0,
    type: "material",
  },
  {
    description: "Diagnostic Labor (1 hr)",
    quantity: 1,
    unitPrice: 120.0,
    total: 120.0,
    type: "labor", // New type: labor
  },
  {
    description: "Replacement Headlight Assembly",
    quantity: 1,
    unitPrice: 300.0,
    total: 300.0,
    type: "parts", // New type: parts
  },
]

export default function InvoicePage() {
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const shopSettings = useQuery(api.pricing.getShopSettings)

  const serviceTaxRate = shopSettings?.serviceTaxRate ?? 0.08 // Default to 8% if not loaded
  const materialTaxRate = shopSettings?.materialTaxRate ?? 0.08 // Default to 8% if not loaded

  // Group items by their tax category
  const itemsForServiceTax = invoiceItems.filter((item) => item.type === "service" || item.type === "labor")
  const itemsForMaterialTax = invoiceItems.filter((item) => item.type === "material" || item.type === "parts")

  const subtotalServices = itemsForServiceTax.reduce((sum, item) => sum + item.total, 0)
  const subtotalMaterials = itemsForMaterialTax.reduce((sum, item) => sum + item.total, 0)

  const taxServices = subtotalServices * serviceTaxRate
  const taxMaterials = subtotalMaterials * materialTaxRate
  const totalTax = taxServices + taxMaterials

  const subtotal = subtotalServices + subtotalMaterials
  const total = subtotal + totalTax

  const invoiceData = {
    number: "INV-12345",
    date: "January 7, 2025",
    dueDate: "January 14, 2025",
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "(555) 123-4567",
      vin: "1HGCM82633A123456",
    },
    appointment: {
      date: "Tuesday, January 7, 2025",
      time: "1:00 PM",
      duration: "2-3 hours",
    },
  }

  const handlePayment = () => {
    setPaymentProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false)
      // In real app, redirect to payment success or dashboard
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/schedule">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Invoice & Payment</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SS</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Slick Solutions</h2>
                        <p className="text-gray-600">Auto Care & Detailing</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>123 Auto Care Lane, City, ST 12345</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>(555) 987-6543</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-gray-900">INVOICE</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Invoice #:</span> {invoiceData.number}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {invoiceData.date}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {invoiceData.dueDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Bill To:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">{invoiceData.customer.name}</div>
                      <div className="text-gray-600">{invoiceData.customer.email}</div>
                      <div className="text-gray-600">{invoiceData.customer.phone}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Vehicle Info:</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">VIN:</span> {invoiceData.customer.vin}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{invoiceData.appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {invoiceData.appointment.time} ({invoiceData.appointment.duration})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Table */}
                <div className="mb-8">
                  <div className="bg-gray-50 px-4 py-3 rounded-t-lg">
                    <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-700">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Unit Price</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                  </div>
                  <div className="border border-t-0 rounded-b-lg">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-b-0 text-sm">
                        <div className="col-span-6">{item.description}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right">${item.unitPrice.toFixed(2)}</div>
                        <div className="col-span-2 text-right font-medium">${item.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service/Labor Tax ({serviceTaxRate * 100}%):</span>
                      <span>${taxServices.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Material/Parts Tax ({materialTaxRate * 100}%):</span>
                      <span>${taxMaterials.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                  <p className="text-sm text-gray-600">
                    Payment is due within 7 days of invoice date. Late payments may incur additional fees. All work is
                    guaranteed for 90 days from completion date.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">${total.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Amount Due</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="text-sm font-medium">Payment Methods</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      💳 Credit Card
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      🏦 Bank Transfer
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      📱 Digital Wallet
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start bg-transparent">
                      💰 Cash
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" size="lg" onClick={handlePayment} disabled={paymentProcessing}>
                  {paymentProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Invoice
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">Secure payment powered by Stripe</div>
              </CardContent>
            </Card>

            {/* Appointment Confirmation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Confirmed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">{invoiceData.appointment.date}</div>
                    <div className="text-sm text-gray-600">{invoiceData.appointment.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-sm text-gray-600">{invoiceData.appointment.duration}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 w-full justify-center">
                  ✓ Appointment Scheduled
                </Badge>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Complete Payment</div>
                    <div className="text-gray-600">Secure your appointment slot</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Receive Confirmation</div>
                    <div className="text-gray-600">Email and SMS reminders</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Visit Our Shop</div>
                    <div className="text-gray-600">Bring your vehicle on time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
