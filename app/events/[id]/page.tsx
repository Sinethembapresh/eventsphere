"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { useAutoJoinEvent } from "@/hooks/use-auto-join-event"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Auto-join event if user came from login
  const { isAttemptingJoin } = useAutoJoinEvent(params.id as string)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${params.id}`)
        if (!res.ok) {
          throw new Error("Event not found")
        }
        const data = await res.json()
        setEvent(data)
      } catch (e: any) {
        setError(e.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse h-24 bg-gray-200 rounded" />
      </div>
    )
  }

  if (isAttemptingJoin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Joining event...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <p className="text-sm text-red-600">{error || "Event not found"}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{event.title}</span>
            <Badge>{event.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {event.currentParticipants || 0}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ""} participants
            </span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{event.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
