"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Upload, Trash2, RotateCcw, QrCode } from "lucide-react"
import Link from "next/link"

interface CapturedPhoto {
  id: string
  url: string
  timestamp: Date
}

export default function MediaUploadPage() {
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([])
  const [vinScanned, setVinScanned] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = () => {
    setIsCapturing(true)
    // Simulate photo capture
    setTimeout(() => {
      const newPhoto: CapturedPhoto = {
        id: Date.now().toString(),
        url: `/placeholder.svg?height=120&width=120&text=Photo${capturedPhotos.length + 1}`,
        timestamp: new Date(),
      }
      setCapturedPhotos((prev) => [...prev, newPhoto])
      setIsCapturing(false)
    }, 1000)
  }

  const handleUploadFromGallery = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file, index) => {
        const newPhoto: CapturedPhoto = {
          id: `${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          timestamp: new Date(),
        }
        setCapturedPhotos((prev) => [...prev, newPhoto])
      })
    }
  }

  const deletePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }

  const retakePhoto = (id: string) => {
    // In a real app, this would reopen camera for that specific shot
    deletePhoto(id)
  }

  const scanVin = () => {
    // Simulate VIN scanning
    setTimeout(() => {
      setVinScanned(true)
    }, 2000)
  }

  const canProceed = capturedPhotos.length >= 4 && vinScanned

  return (
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white relative z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          onClick={scanVin}
          disabled={vinScanned}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {vinScanned ? "VIN Scanned ✓" : "Scan VIN"}
        </Button>
      </div>

      {/* Camera Preview Area */}
      <div className="relative flex-1 flex items-center justify-center bg-gray-900 min-h-[60vh]">
        {/* Camera View Placeholder */}
        <div className="relative w-full max-w-md aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-75">Camera Preview</p>
            </div>
          </div>

          {/* Guide Frame Overlay */}
          <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
            <div className="absolute -top-6 left-0 text-white text-xs">Position vehicle in frame</div>
          </div>

          {/* Overlay Tips */}
          <div className="absolute right-4 top-4 text-white text-xs space-y-1">
            <div className="bg-black/50 px-2 py-1 rounded">• Move closer</div>
            <div className="bg-black/50 px-2 py-1 rounded">• Good lighting</div>
            <div className="bg-black/50 px-2 py-1 rounded">• Clear angles</div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-black/90">
        {/* Capture Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-white hover:bg-gray-200"
            onClick={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleUploadFromGallery}
            className="text-white border-white/50 hover:bg-white/10 bg-transparent"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload from Gallery
          </Button>
        </div>

        {/* Photo Thumbnails */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const photo = capturedPhotos[index]
              return (
                <div key={index} className="flex-shrink-0 relative">
                  {photo ? (
                    <div className="relative group">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={`Captured photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-green-500"
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => retakePhoto(photo.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">{index + 1}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-white text-sm mt-2">
            <span>{capturedPhotos.length}/6 photos captured</span>
            {vinScanned && (
              <Badge variant="secondary" className="bg-green-600">
                VIN Scanned ✓
              </Badge>
            )}
          </div>
        </div>

        {/* Proceed Button */}
        <Link href="/assessment">
          <Button className="w-full" size="lg" disabled={!canProceed}>
            Proceed to Assessment
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Button>
        </Link>

        {!canProceed && (
          <p className="text-center text-gray-400 text-sm mt-2">Capture at least 4 photos and scan VIN to proceed</p>
        )}
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
    </div>
  )
}
