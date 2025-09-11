"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/qr/qr-scanner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Calendar, MapPin, Clock } from "lucide-react"

interface Event {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  organizer: {
    name: string
    department: string
  }
}

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [params.eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
      } else {
        setStatus("error")
        setMessage("Event not found")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (data: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`/api/attendance/${params.eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: data,
          location: event?.location,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Attendance marked successfully!")
        setShowScanner(false)
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to mark attendance")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {event && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {new Date(event.startDate).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              </div>
              <p className="text-sm text-gray-700">{event.description}</p>
              <div className="text-xs text-gray-500">
                Organized by {event.organizer.name} ({event.organizer.department})
              </div>
            </CardContent>
          </Card>
        )}

        {status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status !== "success" && (
          <>
            {!showScanner ? (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h2 className="text-lg font-semibold">Mark Your Attendance</h2>
                  <p className="text-sm text-gray-600">
                    Scan the QR code or enter your attendance code to mark your presence at this event.
                  </p>
                  <Button onClick={() => setShowScanner(true)} className="w-full">
                    Open QR Scanner
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            )}
          </>
        )}

        {status === "success" && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold text-green-700">Attendance Confirmed!</h2>
              <p className="text-sm text-gray-600">
                Your attendance has been successfully recorded. You will receive a certificate after the event
                concludes.
              </p>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
