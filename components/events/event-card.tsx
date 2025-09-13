"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, User } from "lucide-react"
import type { Event } from "@/lib/models/Event"
import { useRouter } from "next/navigation"
import React, { useState, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"

interface EventCardProps {
  event: Event & { _id: string }
  showActions?: boolean
  userRole?: string
  className?: string
}

export function EventCard({ event, showActions = true, userRole, className }: EventCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [joining, setJoining] = useState(false)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)

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
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Technical: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      Cultural: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      Sports: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      Academic: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      Social: "bg-green-100 text-green-800 hover:bg-green-200",
      Career: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
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

  React.useEffect(() => {
    const checkStatus = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setIsRegistered(false)
        return
      }
      try {
        const res = await fetch(`/api/events/${event._id}/register`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (res.status === 401) {
          setIsRegistered(false)
          return
        }
        const data = await res.json().catch(() => ({}))
        setIsRegistered(!!data?.registered)
      } catch {
        setIsRegistered(false)
      }
    }
    checkStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event._id])

  const handleJoin = async () => {
    if (userRole && userRole !== "participant") {
      toast({ title: "Not allowed", description: "Only participants can join events", variant: "destructive" })
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

      if (res.status === 401) {
        router.push(`/auth/login`)
        return
      }

      if (res.status === 403) {
        toast({ title: "Not allowed", description: "Only participants can join events", variant: "destructive" })
        return
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || "Failed to join event")
      }

      toast({ title: "Joined", description: "Successfully registered for event" })
      
      // Refresh registration status after successful join
      const checkStatus = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) return
        
        try {
          const res = await fetch(`/api/events/${event._id}/register`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          })
          if (res.status === 401) return
          const data = await res.json().catch(() => ({}))
          setIsRegistered(!!data?.registered)
        } catch {
          // Ignore errors in status check
        }
      }
      checkStatus()
    } catch (e: any) {
      toast({ title: "Unable to join", description: e.message || "Please try again later", variant: "destructive" })
    } finally {
      setJoining(false)
    }
  }

  return (
    <Card className={`h-full flex flex-col bg-white border-0 shadow-md rounded-xl hover:shadow-xl transition-all duration-200 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight line-clamp-2">{event.title}</h3>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={`${getCategoryColor(event.category)} font-medium px-2.5 py-0.5`}>{event.category}</Badge>
              <Badge className={`${getStatusColor(event.status)} font-medium px-2.5 py-0.5`}>{event.status}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-4">
        <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">{event.description}</p>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formatTime(event.time)}</span>
            {event.endTime && <span>- {formatTime(event.endTime)}</span>}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="line-clamp-1">{event.organizerName}</span>
          </div>

          {event.maxParticipants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className={isRegistered ? "font-semibold text-blue-600" : ""}>
                {event.currentParticipants}/{event.maxParticipants} participants
              </span>
              {isRegistered && (
                <Badge variant="default" className="text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-blue-800">
                  You're in!
                </Badge>
              )}
              {isEventFull && !isRegistered && (
                <Badge variant="destructive" className="text-xs font-medium px-2.5 py-0.5">
                  Full
                </Badge>
              )}
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs font-medium border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs font-medium border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-4 border-t border-gray-100">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
              onClick={() => router.push(`/events/${event._id}`)}
            >
              View Details
            </Button>

            {isRegistered ? (
              <Button 
                className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 font-medium border-green-200" 
                disabled 
                title="You are registered for this event"
              >
                ✓ Registered
              </Button>
            ) : (
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={!!disabledReason}
                title={disabledReason}
                onClick={handleJoin}
              >
                {disabledReason || "Join Event"}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}