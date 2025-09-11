"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Event } from "@/lib/models/Event"

interface RecentEventsProps {
  userRole: string
  limit?: number
}

export function RecentEvents({ userRole, limit = 5 }: RecentEventsProps) {
  const [events, setEvents] = useState<(Event & { _id: string; registrationStatus?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [userRole])

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/dashboard/events?type=upcoming&limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Failed to fetch recent events:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "registered":
        return "bg-blue-100 text-blue-800"
      case "attended":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{userRole === "participant" ? "My Upcoming Events" : "Recent Events"}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => router.push("/events")}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                  <div className="flex gap-1 ml-2">
                    <Badge className={getStatusColor(event.status)} variant="secondary">
                      {event.status}
                    </Badge>
                    {event.registrationStatus && (
                      <Badge className={getStatusColor(event.registrationStatus)} variant="secondary">
                        {event.registrationStatus}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{event.venue}</span>
                  </div>
                  {event.maxParticipants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => router.push(`/events/${event._id}`)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
