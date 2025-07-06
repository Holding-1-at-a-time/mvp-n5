"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Scan, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createInspection } from "./actions"

interface CapturedImage {
  id: string
  blob: Blob
  url: string
  timestamp: Date
}

export default function NewInspectionPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [vinNumber, setVinNumber] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)

  // Initialize camera
  useEffect(() => {
    initializeCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Camera access failed:", error)
      toast.error("Camera access denied. Please enable camera permissions.")
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const id = Date.now().toString()
          const url = URL.createObjectURL(blob)
          const newImage: CapturedImage = {
            id,
            blob,
            url,
            timestamp: new Date(),
          }
          setCapturedImages((prev) => [...prev, newImage])
          toast.success("Photo captured successfully")
        }
      },
      "image/jpeg",
      0.9,
    )
  }

  const removeImage = (id: string) => {
    setCapturedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const scanVIN = async () => {
    setIsScanning(true)
    try {
      // Simulate VIN scanning - in real implementation, this would use OCR
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockVIN = "1HGBH41JXMN109186"
      setVinNumber(mockVIN)
      toast.success("VIN detected successfully")
    } catch (error) {
      toast.error("VIN scanning failed. Please try again.")
    } finally {
      setIsScanning(false)
    }
  }

  const canProceed = capturedImages.length >= 3 && vinNumber.length > 0

  const handleProceed = async () => {
    if (!canProceed) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("vinNumber", vinNumber)

      capturedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image.blob, `photo_${index}.jpg`)
      })

      const result = await createInspection(formData)

      if (result.success) {
        toast.success("Inspection created successfully")
        router.push(`/inspect/${result.inspectionId}`)
      } else {
        toast.error(result.error || "Failed to create inspection")
      }
    } catch (error) {
      console.error("Failed to create inspection:", error)
      toast.error("Failed to create inspection")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Camera Preview */}
      <div className="relative h-[60vh] overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Guide Frame */}
        <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
        </div>

        {/* Camera Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            onClick={capturePhoto}
            size="lg"
            className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-200"
          >
            <Camera className="w-6 h-6" />
          </Button>

          <Button
            onClick={scanVIN}
            disabled={isScanning}
            size="lg"
            className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700"
          >
            {isScanning ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : (
              <Scan className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* VIN Display */}
        {vinNumber && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-sm">
              VIN: {vinNumber}
            </Badge>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="bg-white p-4 space-y-4">
        {/* Thumbnail Strip */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-600">Captured Photos ({capturedImages.length})</h3>

          {capturedImages.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {capturedImages.map((image) => (
                <div key={image.id} className="relative flex-shrink-0">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt="Captured"
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No photos captured yet</p>
              <p className="text-xs">Capture at least 3 photos to proceed</p>
            </div>
          )}
        </div>

        {/* Requirements Checklist */}
        <Card className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {capturedImages.length >= 3 ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded" />
              )}
              <span className={capturedImages.length >= 3 ? "text-green-600" : "text-gray-600"}>
                Capture at least 3 photos ({capturedImages.length}/3)
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {vinNumber ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded" />
              )}
              <span className={vinNumber ? "text-green-600" : "text-gray-600"}>Scan VIN number</span>
            </div>
          </div>
        </Card>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          disabled={!canProceed || isLoading}
          className="w-full h-12 text-lg font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Creating Inspection...
            </div>
          ) : (
            "Proceed to Analysis"
          )}
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
