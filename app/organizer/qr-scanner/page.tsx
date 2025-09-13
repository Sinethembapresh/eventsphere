"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/qr/qr-scanner"
import { QRCodeDisplay } from "@/components/qr/qr-code-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Camera, Download, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OrganizerQRScanner() {
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
              <p className="text-gray-600 mt-1">Generate QR codes and scan participant check-ins</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/organizer/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              QR Scanner
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Generator
            </TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Participant Check-in Scanner
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Scan participant QR codes to check them into events
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <QRScanner 
                    onScan={(data) => {
                      console.log("QR Code scanned:", data)
                    }}
                    onClose={() => {
                      console.log("Scanner closed")
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Event QR Code Generator
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Generate QR codes for your events that participants can scan to check in
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <QRCodeDisplay 
                    eventId="68c4000f8d9436ca3a9bfd07"
                    eventTitle="Sample Event"
                    eventDate="2024-01-15"
                    eventVenue="Main Hall"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use QR Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      For Organizers
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Generate QR codes for your events</li>
                      <li>• Display QR codes at event venues</li>
                      <li>• Use the scanner to check in participants</li>
                      <li>• QR codes expire after 24 hours for security</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      For Participants
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Scan QR codes at event venues</li>
                      <li>• Automatic check-in when scanned</li>
                      <li>• Must be registered for the event</li>
                      <li>• Must be logged into the app</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
