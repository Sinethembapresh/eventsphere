"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"
import { isValidEventQRCode, isQRCodeExpired } from "@/lib/qr-code"

interface QRScannerProps {
  onScan?: (data: string) => void
  onClose?: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'pending' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)
      setScanResult(null)
      setScannedData(null)

      // Initialize the code reader
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices()
      
      // Prefer back camera if available
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      )
      
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId

      if (!selectedDeviceId) {
        throw new Error("No camera devices found")
      }

      // Start decoding from video element
      if (videoRef.current) {
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText()
              console.log("QR Code detected:", text)
              handleScan(text)
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error("QR Code scanning error:", error)
            }
          }
        )
      }
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Unable to access camera. Please check permissions and try again.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    // Stop the code reader
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }

    // Stop the video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Clear any scanning intervals
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current)
      scanningIntervalRef.current = null
    }

    setIsScanning(false)
    setScanResult(null)
    setScannedData(null)
  }

  const handleScan = async (data: string) => {
    // Prevent multiple scans of the same code
    if (scannedData === data) return
    
    setScannedData(data)
    setScanResult('pending')
    
    // Stop scanning to prevent multiple scans
    stopScanning()
    
    try {
      // Validate QR code format
      if (!isValidEventQRCode(data)) {
        setScanResult('error')
        toast({
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid event QR code.",
          variant: "destructive"
        })
        return
      }

      // Check if QR code is expired
      if (isQRCodeExpired(data)) {
        setScanResult('error')
        toast({
          title: "QR Code Expired",
          description: "This QR code has expired. Please get a fresh one from the event organizer.",
          variant: "destructive"
        })
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setScanResult('error')
        toast({
          title: "Authentication Required",
          description: "Please log in to check in to events.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrData: data })
      })

      const result = await response.json()

      if (response.ok) {
        setScanResult('success')
        toast({
          title: "Check-in Successful! 🎉",
          description: `You have been checked in to: ${result.event?.title || 'the event'}`,
        })
        onScan?.(data)
      } else {
        setScanResult('error')
        toast({
          title: "Check-in Failed",
          description: result.error || "Unable to check in. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Check-in error:", error)
      setScanResult('error')
      toast({
        title: "Check-in Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      })
    }
  }


  const simulateQRScan = () => {
    // For demo purposes - simulate scanning a QR code
    const eventId = "68c4000f8d9436ca3a9bfd07" // Example event ID
    const timestamp = Date.now()
    const mockQRData = `event:${eventId}:checkin:${timestamp}`
    handleScan(mockQRData)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Event Check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning && !scannedData && (
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Scan the QR code at the event venue to check in
            </p>
            <div className="flex gap-2">
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
              <Button variant="outline" onClick={simulateQRScan}>
                Demo Scan
              </Button>
            </div>
          </div>
        )}

        {isScanning && !scannedData && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            </div>
            <p className="text-sm text-center text-gray-600">
              Position the QR code within the frame
            </p>
            <Button variant="outline" onClick={stopScanning} className="w-full">
              Stop Scanning
            </Button>
          </div>
        )}

        {scannedData && (
          <div className="space-y-4">
            <div className="text-center">
              {scanResult === 'success' && (
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold text-green-700">Check-in Successful!</h3>
                  <p className="text-sm text-gray-600">You have been registered for attendance</p>
                </div>
              )}
              
              {scanResult === 'error' && (
                <div className="space-y-2">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <h3 className="text-lg font-semibold text-red-700">Check-in Failed</h3>
                  <p className="text-sm text-gray-600">Invalid QR code or event not found</p>
                </div>
              )}
              
              {scanResult === 'pending' && (
                <div className="space-y-2">
                  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto animate-pulse" />
                  <h3 className="text-lg font-semibold text-yellow-700">Processing...</h3>
                  <p className="text-sm text-gray-600">Verifying your check-in</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Scanned Data:</p>
              <p className="text-sm font-mono break-all">{scannedData}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setScannedData(null)
                  setScanResult(null)
                  setError(null)
                  startScanning()
                }}
                className="flex-1"
              >
                Scan Again
              </Button>
              {scanResult === 'success' ? (
                <Button onClick={onClose} className="flex-1">
                  Done
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setScannedData(null)
                    setScanResult(null)
                    setError(null)
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}