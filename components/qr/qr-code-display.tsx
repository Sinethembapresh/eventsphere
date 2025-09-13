"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, RefreshCw, Clock, Calendar, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface QRCodeDisplayProps {
  eventId: string
  eventTitle?: string
  eventDate?: string
  eventVenue?: string
}

interface QRCodeData {
  qrData: string
  event: {
    id: string
    title: string
    date: string
    venue: string
  }
  expiresAt: string
}

export function QRCodeDisplay({ eventId, eventTitle, eventDate, eventVenue }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const generateQRCode = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`/api/events/${eventId}/qr-code`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate QR code")
      }

      const data = await response.json()
      setQrData(data)
      
      toast({
        title: "QR Code Generated",
        description: "QR code is ready for event check-in",
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Failed to Generate QR Code",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrData) return

    // Create a simple text file with the QR code data
    const content = `Event QR Code
================
Event: ${qrData.event.title}
Date: ${new Date(qrData.event.date).toLocaleDateString()}
Venue: ${qrData.event.venue}
QR Data: ${qrData.qrData}
Expires: ${new Date(qrData.expiresAt).toLocaleString()}

Instructions:
1. Display this QR code at the event venue
2. Participants can scan it using the EventSphere app
3. QR code expires in 24 hours
4. Generate a new code if needed`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `event-qr-code-${eventId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "QR Code Downloaded",
      description: "QR code data saved to file",
    })
  }

  const copyQRData = () => {
    if (!qrData) return
    
    navigator.clipboard.writeText(qrData.qrData)
    toast({
      title: "QR Data Copied",
      description: "QR code data copied to clipboard",
    })
  }

  useEffect(() => {
    generateQRCode()
  }, [eventId])

  const isExpired = qrData ? new Date(qrData.expiresAt) < new Date() : false
  const timeUntilExpiry = qrData ? Math.max(0, new Date(qrData.expiresAt).getTime() - Date.now()) : 0
  const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60))

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Event Check-in QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateQRCode}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {qrData && !loading && (
          <>
            {/* Event Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">{qrData.event.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(qrData.event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{qrData.event.venue}</span>
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="text-center space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-xs font-mono break-all bg-gray-100 p-2 rounded">
                  {qrData.qrData}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Display this code for participants to scan
                </p>
              </div>

              {/* Expiry Info */}
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="outline">
                    Expires in {hoursUntilExpiry}h
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyQRData}
                className="flex-1"
              >
                Copy Data
              </Button>
              <Button
                variant="outline"
                onClick={downloadQRCode}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Button
              onClick={generateQRCode}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate New Code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
