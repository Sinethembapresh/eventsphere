"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Award, 
  ArrowLeft,
  Calendar,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import { CertificateIssuance } from "@/components/certificates/certificate-issuance"
import type { Event } from "@/lib/models/Event"

export default function CertificateIssuePage() {
  const [events, setEvents] = useState<(Event & { _id: string })[]>([])
  const [selectedEvent, setSelectedEvent] = useState<(Event & { _id: string }) | null>(null)
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

  const handleEventSelect = (eventId: string) => {
    const event = events.find(e => e._id === eventId)
    setSelectedEvent(event || null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issue Certificates</h1>
            <p className="text-gray-600">Issue certificates to participants who attended your events</p>
          </div>
        </div>

        {/* Event Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Event
            </CardTitle>
            <p className="text-sm text-gray-600">Choose an event to issue certificates for</p>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 mb-4">You need to create events before issuing certificates</p>
                <Button onClick={() => router.push("/organizer/events")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Select onValueChange={handleEventSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event to issue certificates for" />
                  </SelectTrigger>
                  <SelectContent>
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

                {selectedEvent && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-900">{selectedEvent.title}</h3>
                        <p className="text-sm text-blue-700 mt-1">{selectedEvent.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(selectedEvent.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {selectedEvent.currentParticipants || 0} participants
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate Issuance */}
        {selectedEvent && (
          <CertificateIssuance 
            event={selectedEvent}
            onCertificatesIssued={() => {
              // Optionally refresh data or show success message
            }}
          />
        )}
      </div>
    </div>
  )
}
