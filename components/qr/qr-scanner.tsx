"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)
      setScanResult(null)
      setScannedData(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    setScanResult(null)
    setScannedData(null)
  }

  const handleScan = async (data: string) => {
    setScannedData(data)
    setScanResult('pending')
    
    try {
      // Simulate QR code processing
      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ qrData: data })
      })

      if (response.ok) {
        setScanResult('success')
        toast({
          title: "Check-in Successful",
          description: "You have been successfully checked in to the event.",
        })
        onScan?.(data)
      } else {
        setScanResult('error')
        toast({
          title: "Check-in Failed",
          description: "Invalid QR code or event not found.",
          variant: "destructive"
        })
      }
    } catch (error) {
      setScanResult('error')
      toast({
        title: "Check-in Failed",
        description: "An error occurred during check-in.",
        variant: "destructive"
      })
    }
  }

  const simulateQRScan = () => {
    // For demo purposes - simulate scanning a QR code
    const mockQRData = "event:68c4000f8d9436ca3a9bfd07:checkin:12345"
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
                  startScanning()
                }}
                className="flex-1"
              >
                Scan Again
              </Button>
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
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