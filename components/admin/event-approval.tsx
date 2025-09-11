"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/models/Event"

export function EventApproval() {
  const [pendingEvents, setPendingEvents] = useState<(Event & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<(Event & { _id: string }) | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [approvalMessage, setApprovalMessage] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const fetchPendingEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/events/pending")
      if (response.ok) {
        const data = await response.json()
        setPendingEvents(data.events)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: approvalMessage }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Event approved successfully",
        })
        setApprovalMessage("")
        fetchPendingEvents()
      } else {
        throw new Error("Failed to approve event")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve event",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (eventId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setActionLoading(eventId)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Event rejected successfully",
        })
        setRejectReason("")
        fetchPendingEvents()
      } else {
        throw new Error("Failed to reject event")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject event",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Approval Queue</CardTitle>
        <p className="text-sm text-muted-foreground">Review and approve events submitted by organizers</p>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : pendingEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No events pending approval</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingEvents.map((event) => (
              <div key={event._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                      <Badge variant="outline">{event.department}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{event.organizerName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{event.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Event Details</h4>
                            <div className="space-y-1 text-sm">
                              <p>Date: {formatDate(event.date)}</p>
                              <p>Time: {formatTime(event.time)}</p>
                              <p>Venue: {event.venue}</p>
                              <p>Category: {event.category}</p>
                              <p>Department: {event.department}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Organizer</h4>
                            <div className="space-y-1 text-sm">
                              <p>Name: {event.organizerName}</p>
                              <p>Contact: {event.contactInfo?.email}</p>
                              {event.contactInfo?.phone && <p>Phone: {event.contactInfo.phone}</p>}
                            </div>
                          </div>
                        </div>

                        {event.requirements && event.requirements.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Requirements</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {event.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={actionLoading === event._id}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Event</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to approve "{event.title}"?
                        </p>
                        <Textarea
                          placeholder="Optional approval message for the organizer..."
                          value={approvalMessage}
                          onChange={(e) => setApprovalMessage(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleApprove(event._id)} disabled={actionLoading === event._id}>
                            Approve Event
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={actionLoading === event._id}>
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Event</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Please provide a reason for rejecting "{event.title}":
                        </p>
                        <Textarea
                          placeholder="Reason for rejection (required)..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(event._id)}
                            disabled={actionLoading === event._id || !rejectReason.trim()}
                          >
                            Reject Event
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
