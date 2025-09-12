"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, User } from "lucide-react"
import type { Event } from "@/lib/models/Event"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"

interface EventCardProps {
  event: Event & { _id: string }
  showActions?: boolean
  userRole?: string
}

export function EventCard({ event, showActions = true, userRole }: EventCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [joining, setJoining] = useState(false)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
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
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Technical: "bg-purple-100 text-purple-800",
      Cultural: "bg-pink-100 text-pink-800",
      Sports: "bg-orange-100 text-orange-800",
      Academic: "bg-blue-100 text-blue-800",
      Social: "bg-green-100 text-green-800",
      Career: "bg-indigo-100 text-indigo-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const registrationDeadlineDate = useMemo(() => {
    try {
      return event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.date)
    } catch {
      return new Date(event.date)
    }
  }, [event.registrationDeadline, event.date])

  const isEventFull = !!event.maxParticipants && (event.currentParticipants || 0) >= event.maxParticipants
  const isRegistrationClosed = new Date() > registrationDeadlineDate
  const isEventPast = new Date() > new Date(event.date)
  const isApproved = event.status === "approved"

  const disabledReason = !isApproved
    ? "Pending approval"
    : isEventPast
    ? "Event ended"
    : isEventFull
    ? "Full"
    : isRegistrationClosed
    ? "Closed"
    : joining
    ? "Joining..."
    : ""

  const handleJoin = async () => {
    // Allow unauthenticated users to click; redirect to login if API says unauthorized
    if (userRole && userRole !== "participant" && userRole !== "student") {
      toast({ title: "Not allowed", description: "Only students can join events", variant: "destructive" })
      return
    }

    if (joining) return
    setJoining(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        router.push(`/auth/login`)
        return
      }

      const res = await fetch(`/api/events/${event._id}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      // If not logged in, redirect to login
      if (res.status === 401) {
        router.push(`/auth/login`)
        return
      }

      // If logged in but lacks permissions
      if (res.status === 403) {
        toast({ title: "Not allowed", description: "Only students can join events", variant: "destructive" })
        return
      }

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || "Failed to join event")
      }

      toast({ title: "Joined", description: "Successfully registered for event" })
    } catch (e: any) {
      toast({ title: "Unable to join", description: e.message || "Please try again later", variant: "destructive" })
    } finally {
      setJoining(false)
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight text-balance">{event.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
              <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{event.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(event.time)}</span>
            {event.endTime && <span>- {formatTime(event.endTime)}</span>}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.venue}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{event.organizerName}</span>
          </div>

          {event.maxParticipants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.currentParticipants}/{event.maxParticipants} participants
              </span>
              {isEventFull && (
                <Badge variant="destructive" className="text-xs">
                  Full
                </Badge>
              )}
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.push(`/events/${event._id}`)}
            >
              View Details
            </Button>

            <Button
              className="flex-1"
              disabled={!!disabledReason}
              title={disabledReason}
              onClick={handleJoin}
            >
              {disabledReason || "Join Event"}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
