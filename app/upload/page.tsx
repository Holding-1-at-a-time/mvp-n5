"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Upload, Trash2, RotateCcw, QrCode, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CapturedPhoto {
  id: string
  url: string
  timestamp: Date
  blob?: Blob
}

export default function MediaUploadPage() {
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([])
  const [vinScanned, setVinScanned] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera()
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const initializeCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported on this device")
        return
      }

      // Request camera permission and stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setCameraStream(stream)
      setCameraPermission("granted")
      setCameraError(null)

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error("Camera initialization error:", error)
      setCameraPermission("denied")

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError("Camera permission denied. Please allow camera access and refresh the page.")
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found on this device.")
        } else if (error.name === "NotSupportedError") {
          setCameraError("Camera not supported on this device.")
        } else {
          setCameraError("Failed to access camera. Please try again.")
        }
      }
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) {
      return
    }

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const photoUrl = URL.createObjectURL(blob)
            const newPhoto: CapturedPhoto = {
              id: Date.now().toString(),
              url: photoUrl,
              timestamp: new Date(),
              blob: blob,
            }
            setCapturedPhotos((prev) => [...prev, newPhoto])
          }
          setIsCapturing(false)
        },
        "image/jpeg",
        0.9,
      )
    } catch (error) {
      console.error("Photo capture error:", error)
      setIsCapturing(false)
    }
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
          blob: file,
        }
        setCapturedPhotos((prev) => [...prev, newPhoto])
      })
    }
  }

  const deletePhoto = (id: string) => {
    const photoToDelete = capturedPhotos.find((photo) => photo.id === id)
    if (photoToDelete) {
      // Revoke object URL to free memory
      URL.revokeObjectURL(photoToDelete.url)
    }
    setCapturedPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }

  const retakePhoto = (id: string) => {
    deletePhoto(id)
  }

  const scanVin = () => {
    // Simulate VIN scanning - in real app, this would use OCR
    setTimeout(() => {
      setVinScanned(true)
    }, 2000)
  }

  const switchCamera = async () => {
    if (cameraStream) {
      // Stop current stream
      cameraStream.getTracks().forEach((track) => track.stop())
    }

    try {
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")

      if (videoDevices.length > 1) {
        // Switch between front and back camera
        const currentFacingMode = cameraStream?.getVideoTracks()[0]?.getSettings()?.facingMode
        const newFacingMode = currentFacingMode === "environment" ? "user" : "environment"

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: newFacingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })

        setCameraStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }
    } catch (error) {
      console.error("Camera switch error:", error)
    }
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
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={switchCamera}
            disabled={!cameraStream}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Switch
          </Button>
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
      </div>

      {/* Camera Error Alert */}
      {cameraError && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Camera Preview Area - Full Screen */}
      <div className="relative flex-1 bg-black min-h-[70vh]">
        {cameraStream && !cameraError ? (
          <>
            {/* Live Video Stream */}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Rectangular Guide Frame - Centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-60 border-4 border-white/70 rounded-lg relative">
                <div className="absolute -top-8 left-0 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                  Position vehicle in frame
                </div>
                {/* Corner guides */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-white"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-white"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-white"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-white"></div>
              </div>
            </div>

            {/* Overlay Tips - Right Side */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white space-y-3 pointer-events-none">
              <div className="bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium">Photo tips:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• Move closer</li>
                  <li>• Good lighting</li>
                  <li>• Clear angles</li>
                  <li>• Avoid shadows</li>
                  <li>• Hold steady</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* Fallback when camera is not available */
          <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="h-20 w-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg opacity-75">{cameraError ? "Camera Unavailable" : "Initializing Camera..."}</p>
              {cameraPermission === "denied" && (
                <Button onClick={initializeCamera} className="mt-4 bg-transparent" variant="outline">
                  Retry Camera Access
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/95 p-6">
        {/* Main Capture Controls */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <Button
            size="lg"
            className="rounded-full w-20 h-20 bg-white hover:bg-gray-200 border-4 border-gray-300 disabled:opacity-50"
            onClick={capturePhoto}
            disabled={isCapturing || !cameraStream || !!cameraError}
          >
            {isCapturing ? (
              <div className="w-8 h-8 border-3 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-12 h-12 bg-gray-800 rounded-full border-2 border-gray-600" />
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleUploadFromGallery}
            className="text-white border-white/50 hover:bg-white/10 bg-transparent px-6"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload from Gallery
          </Button>
        </div>

        {/* Photo Thumbnails Strip */}
        <div className="mb-6">
          <div className="flex gap-3 justify-center overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const photo = capturedPhotos[index]
              return (
                <div key={index} className="shrink-0 relative">
                  {photo ? (
                    <div className="relative group">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={`Captured photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-3 border-green-500"
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => retakePhoto(photo.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center bg-gray-800/50">
                      <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-white text-sm mt-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">{capturedPhotos.length}/6 photos captured</span>
              {vinScanned && (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  VIN Scanned ✓
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-400">{cameraStream ? "Camera active" : "Camera inactive"}</div>
          </div>
        </div>

        {/* Proceed Button */}
        <Link href="/assessment">
          <Button className="w-full" size="lg" disabled={!canProceed} variant={canProceed ? "default" : "secondary"}>
            Proceed to Assessment
            <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          </Button>
        </Link>

        {!canProceed && (
          <p className="text-center text-gray-400 text-sm mt-3">Capture at least 4 photos and scan VIN to proceed</p>
        )}
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
    </div>
  )
}
