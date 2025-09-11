"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Star, Plus, Eye, Edit, CheckCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Event } from "@/lib/models/Event"

interface OrganizerStats {
  totalEvents: number
  approvedEvents: number
  pendingEvents: number
  completedEvents: number
  totalRegistrations: number
  averageRating: number
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerStats>({
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
    totalRegistrations: 0,
    averageRating: 0,
  })
  const [recentEvents, setRecentEvents] = useState<(Event & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResponse, eventsResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/events?limit=5"),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setRecentEvents(eventsData.events)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your events and track performance</p>
            </div>
            <Button onClick={() => router.push("/events/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            description="Events created"
            icon={Calendar}
            className="bg-blue-50 border-blue-200"
          />
          <StatsCard
            title="Approved Events"
            value={stats.approvedEvents}
            description="Live events"
            icon={CheckCircle}
            className="bg-green-50 border-green-200"
          />
          <StatsCard
            title="Pending Approval"
            value={stats.pendingEvents}
            description="Awaiting review"
            icon={Clock}
            className="bg-yellow-50 border-yellow-200"
          />
          <StatsCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            description="Event feedback"
            icon={Star}
            className="bg-purple-50 border-purple-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Events</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/organizer/events")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No events created yet</p>
                    <Button className="mt-4" onClick={() => router.push("/events/create")}>
                      Create Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                          <Badge className={getStatusColor(event.status)} variant="secondary">
                            {event.status}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground mb-3">
                          <p>Date: {formatDate(event.date)}</p>
                          <p>Venue: {event.venue}</p>
                          <p>
                            Participants: {event.currentParticipants || 0}
                            {event.maxParticipants && `/${event.maxParticipants}`}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/events/${event._id}`)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/organizer/events/${event._id}/edit`)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => router.push("/events/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/organizer/events")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Events
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/organizer/participants")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Participants
                </Button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Registrations</span>
                  <span className="font-medium">{stats.totalRegistrations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Events</span>
                  <span className="font-medium">{stats.completedEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">
                    {stats.totalEvents > 0 ? Math.round((stats.completedEvents / stats.totalEvents) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Add detailed descriptions to attract more participants</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Set registration deadlines to create urgency</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Upload event photos to increase engagement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
