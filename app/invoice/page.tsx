"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, CreditCard, Check } from "lucide-react"
import Link from "next/link"

export default function InvoicePage() {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "paid">("pending")

  const handlePayment = () => {
    setPaymentStatus("processing")
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus("paid")
    }, 2000)
  }

  const invoiceData = {
    invoiceNumber: "INV-12345",
    date: new Date().toLocaleDateString(),
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    vin: "1HGCM82633A123456",
    appointmentDate: "Tue 7/6 • 1:00 PM",
    services: [
      { description: "Scratch Buffing", quantity: 1, unitPrice: 50.0, total: 50.0 },
      { description: "Leather Care Treatment", quantity: 1, unitPrice: 30.0, total: 30.0 },
      { description: "Paint Touch-up", quantity: 1, unitPrice: 75.0, total: 75.0 },
    ],
    subtotal: 155.0,
    tax: 12.4,
    total: 167.4,
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
            <h1 className="text-xl font-semibold">Invoice</h1>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Payment Status */}
        {paymentStatus === "paid" && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-green-900">Payment Successful!</h3>
                  <p className="text-green-700 text-sm">Your appointment is confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice */}
        <Card className="mb-6">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">Slick Solutions</h2>
                <p className="text-gray-600">Professional Auto Care</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Invoice #{invoiceData.invoiceNumber}</p>
                <p className="text-sm text-gray-600">Date: {invoiceData.date}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="text-gray-700">{invoiceData.customerName}</p>
                <p className="text-gray-600 text-sm">{invoiceData.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vehicle Info:</h3>
                <p className="text-gray-700">VIN: {invoiceData.vin}</p>
                <p className="text-gray-600 text-sm">Appointment: {invoiceData.appointmentDate}</p>
              </div>
            </div>

            {/* Services Table */}
            <div className="mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2 w-16">Qty</th>
                    <th className="text-right py-2 w-20">Unit $</th>
                    <th className="text-right py-2 w-20">Total $</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.services.map((service, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{service.description}</td>
                      <td className="py-2 text-center">{service.quantity}</td>
                      <td className="py-2 text-right">${service.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right">${service.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-right border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>${invoiceData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span>${invoiceData.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {paymentStatus !== "paid" && (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-sm text-gray-600">Secure payment via Stripe</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Recommended</Badge>
                </div>

                <Button size="lg" className="w-full" onClick={handlePayment} disabled={paymentStatus === "processing"}>
                  {paymentStatus === "processing" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${invoiceData.total.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">Your payment is secured by 256-bit SSL encryption</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Actions */}
        {paymentStatus === "paid" && (
          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" className="w-full bg-transparent">
                View Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button size="lg" className="w-full">
                New Inspection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
