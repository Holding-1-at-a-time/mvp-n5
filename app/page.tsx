"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, FileImage, Wrench, Calendar, Receipt, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Slick Solutions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered vehicle inspection and repair management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Media Upload
                </CardTitle>
                <CardDescription>Capture vehicle photos and scan VIN</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Guide customers through high-quality photo capture with AI assistance
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assessment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-green-600" />
                  Assessment
                </CardTitle>
                <CardDescription>AI damage detection and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Visualize detected damage with interactive hotspots</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estimate">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Estimate
                </CardTitle>
                <CardDescription>Edit and approve service estimates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Customize line items and pricing before scheduling</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/schedule">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Scheduling
                </CardTitle>
                <CardDescription>AI-recommended appointment slots</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Smart scheduling with optimal time recommendations</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/invoice">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-red-600" />
                  Invoice
                </CardTitle>
                <CardDescription>Generate and manage invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Professional invoicing with payment integration</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Dashboard
                </CardTitle>
                <CardDescription>Shop management and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Overview of jobs, revenue, and performance metrics</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
