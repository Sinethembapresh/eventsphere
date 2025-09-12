"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, Plus } from "lucide-react"

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const authHeaders = () => {
    const headers: Record<string, string> = {}
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/dashboard/events?limit=50", { headers: authHeaders(), credentials: "include" })
        const data = await res.json()
        if (res.ok) setEvents(data.events || [])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse h-24 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Events</h1>
        <Button onClick={() => router.push("/events/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No events yet.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{event.title}</CardTitle>
                <Badge>{event.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/events/${event._id}`)}>
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/organizer/events/${event._id}/edit`)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
