import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Edit Estimate</h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            Loading...
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="grid grid-cols-1 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
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
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100">
                    <div className="col-span-5 space-y-1">
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-2/5" />
                    </div>
                    <div className="col-span-1">
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="col-span-2 text-right">
                      <Skeleton className="h-5 w-3/4 ml-auto" />
                    </div>
                    <div className="col-span-2 flex justify-center gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
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
              <Skeleton className="h-5 w-20 inline-block" />
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Tax (8%): </span>
              <Skeleton className="h-5 w-16 inline-block" />
            </div>
            <div className="text-lg">
              <span className="text-gray-600">Total: </span>
              <Skeleton className="h-7 w-24 inline-block" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}
