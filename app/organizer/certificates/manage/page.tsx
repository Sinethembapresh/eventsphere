"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Award, 
  ArrowLeft,
  Calendar,
  Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import { CertificateManagement } from "@/components/certificates/certificate-management"
import type { Event } from "@/lib/models/Event"

export default function CertificateManagePage() {
  const [events, setEvents] = useState<(Event & { _id: string })[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch('/api/organizer/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
              <p className="text-gray-600">View, track, and manage all issued certificates</p>
            </div>
          </div>
        </div>

        {/* Event Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by Event
            </CardTitle>
            <p className="text-sm text-gray-600">View certificates for a specific event or all events</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select an event to filter certificates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()} • {event.venue}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedEventId !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedEventId("all")}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Management */}
        <CertificateManagement 
          eventId={selectedEventId === "all" ? undefined : selectedEventId}
          onCertificateAction={() => {
            // Optionally refresh data or show success message
          }}
        />
      </div>
    </div>
  )
}
