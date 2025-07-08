"use client"

import { BrowserMultiFormatReader } from "@zxing/library"
import { useEffect, useRef, useState } from "react"

interface UseVinScannerProps {
  onDetected: (vin: string) => void
  isActive: boolean
}

export function useVinScanner({ onDetected, isActive }: UseVinScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanner, setScanner] = useState<BrowserMultiFormatReader>()
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!isActive) {
      cleanup()
      return
    }

    const codeReader = new BrowserMultiFormatReader()
    setScanner(codeReader)

    const startScanning = async () => {
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

        codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
          if (result) {
            const scannedText = result.getText().replace(/[^A-Z0-9]/gi, "")

            // Validate VIN format (17 characters, alphanumeric)
            if (scannedText.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(scannedText)) {
              onDetected(scannedText.toUpperCase())
              cleanup()
            }
          }
        })
      } catch (error) {
        console.error("Camera access failed:", error)
        setError("Camera access denied. Please enable camera permissions.")
      }
    }

    startScanning()

    return cleanup
  }, [isActive, onDetected])

  const cleanup = () => {
    if (scanner) {
      scanner.reset()
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  return { videoRef, error, cleanup }
}
