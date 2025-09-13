"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Users, 
  Star, 
  Plus, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock,
  QrCode,
  FileText,
  Upload,
  MessageSquare,
  BarChart3,
  Award,
  Camera,
  Send,
  Download,
  Filter,
  Search
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Event } from "@/lib/models/Event"

interface OrganizerStats {
  totalEvents: number
  approvedEvents: number
  pendingEvents: number
  completedEvents: number
  totalRegistrations: number
  totalAttendees: number
  averageRating: number
  pendingRegistrations: number
  certificatesIssued: number
}

interface Registration {
  _id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  userDepartment: string
  registrationDate: string
  status: 'registered' | 'attended' | 'cancelled' | 'no-show'
  attendanceTime?: string
}

interface MediaItem {
  _id: string
  eventId: string
  type: 'image' | 'video'
  url: string
  caption?: string
  uploadedAt: string
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerStats>({
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
    totalRegistrations: 0,
    totalAttendees: 0,
    averageRating: 0,
    pendingRegistrations: 0,
    certificatesIssued: 0,
  })
  const [recentEvents, setRecentEvents] = useState<(Event & { _id: string })[]>([])
  const [pendingList, setPendingList] = useState<(Event & { _id: string })[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const authHeaders = () => {
    const headers: Record<string, string> = {}
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  const fetchData = async () => {
    try {
      const [statsResponse, eventsResponse, pendingResponse, registrationsResponse, mediaResponse] = await Promise.all([
        fetch("/api/organizer/dashboard/stats", { headers: authHeaders(), credentials: "include" }),
        fetch("/api/organizer/events?limit=5", { headers: authHeaders(), credentials: "include" }),
        fetch("/api/organizer/events?type=pending&limit=5", { headers: authHeaders(), credentials: "include" }),
        fetch("/api/organizer/registrations", { headers: authHeaders(), credentials: "include" }),
        fetch("/api/organizer/media", { headers: authHeaders(), credentials: "include" }),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setRecentEvents(eventsData.events)
      }

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingList(pendingData.events)
      }

      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json()
        setRegistrations(registrationsData.registrations)
      }

      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        setMediaItems(mediaData.media)
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

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/organizer/registrations/${registrationId}/approve`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: "include"
      })

      if (response.ok) {
        toast({
          title: "Registration Approved",
          description: "Participant registration has been approved",
        })
        fetchData() // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive"
      })
    }
  }

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/organizer/registrations/${registrationId}/reject`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: "include"
      })

      if (response.ok) {
        toast({
          title: "Registration Rejected",
          description: "Participant registration has been rejected",
        })
        fetchData() // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive"
      })
    }
  }

  const generateAttendanceReport = async (eventId: string) => {
    try {
      const response = await fetch(`/api/organizer/events/${eventId}/attendance-report`, {
        headers: authHeaders(),
        credentials: "include"
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-report-${eventId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Report Generated",
          description: "Attendance report has been downloaded",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate attendance report",
        variant: "destructive"
      })
    }
  }

  const sendAnnouncement = async (eventId: string, message: string) => {
    try {
      const response = await fetch(`/api/organizer/events/${eventId}/announcement`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
        credentials: "include"
      })

      if (response.ok) {
        toast({
          title: "Announcement Sent",
          description: "Message sent to all registered participants",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive"
      })
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage events, registrations, attendance, and more</p>
            </div>
            <Button onClick={() => router.push("/events/create")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            description="Events created"
            icon={Calendar}
            className="bg-blue-50 border-blue-200"
          />
          <StatsCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            description="Participant signups"
            icon={Users}
            className="bg-green-50 border-green-200"
          />
          <StatsCard
            title="Attendees"
            value={stats.totalAttendees}
            description="Event participants"
            icon={CheckCircle}
            className="bg-purple-50 border-purple-200"
          />
          <StatsCard
            title="Certificates Issued"
            value={stats.certificatesIssued}
            description="Awards distributed"
            icon={Award}
            className="bg-orange-50 border-orange-200"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateAttendanceReport(event._id)}
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Report
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
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
                      className="w-full justify-start"
                      onClick={() => router.push("/organizer/events")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/organizer/participants")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Participants
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/organizer/qr-scanner")}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Scanner
                    </Button>
                  </CardContent>
                </Card>

                {/* Pending Events */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingList.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No pending events.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingList.map((event) => (
                          <div key={event._id} className="border rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{event.title}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(event.date)} • {event.venue}</p>
                              </div>
                              <Badge className={getStatusColor(event.status)} variant="secondary">{event.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registration Management
                </CardTitle>
                <p className="text-sm text-gray-600">View and manage participant registrations in real-time</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>

                {registrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                    <p className="text-gray-500">Registrations will appear here as participants sign up for your events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div key={registration._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{registration.userName}</h4>
                            <p className="text-sm text-gray-600">{registration.userEmail}</p>
                            <p className="text-xs text-gray-500">{registration.userDepartment}</p>
                          </div>
                          <Badge 
                            variant={registration.status === 'registered' ? 'default' : 
                                   registration.status === 'attended' ? 'secondary' : 'destructive'}
                          >
                            {registration.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <p>Registered: {formatDate(registration.registrationDate)}</p>
                            {registration.attendanceTime && (
                              <p>Attended: {formatDate(registration.attendanceTime)}</p>
                            )}
                          </div>
                          
                          {registration.status === 'registered' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRegistration(registration._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectRegistration(registration._id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Attendance Tracking
                </CardTitle>
                <p className="text-sm text-gray-600">Scan QR codes and validate check-ins on event day</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">QR Code Scanner</h4>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">Scan participant QR codes for check-in</p>
                      <Button onClick={() => router.push("/organizer/qr-scanner")}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Open Scanner
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Attendance Reports</h4>
                    <div className="space-y-3">
                      {recentEvents.slice(0, 3).map((event) => (
                        <div key={event._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateAttendanceReport(event._id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Report
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificate Management
                </CardTitle>
                <p className="text-sm text-gray-600">Upload and issue certificates to eligible participants</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Certificate Management</h3>
                  <p className="text-gray-500 mb-4">Upload templates and issue certificates to participants who attended and paid fees</p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Template
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Issue Certificates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Media & Gallery
                </CardTitle>
                <p className="text-sm text-gray-600">Upload photos and videos from events to gallery</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    View Gallery
                  </Button>
                </div>

                {mediaItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No media uploaded yet</h3>
                    <p className="text-gray-500">Upload photos and videos from your events to share with participants</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                      <div key={item._id} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.type === 'image' ? (
                          <Camera className="h-8 w-8 text-gray-400" />
                        ) : (
                          <div className="text-gray-400">Video</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication & Announcements
                </CardTitle>
                <p className="text-sm text-gray-600">Send announcements and moderate participant feedback</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Send Announcements</h4>
                    <div className="space-y-3">
                      {recentEvents.slice(0, 3).map((event) => (
                        <div key={event._id} className="border rounded-lg p-4">
                          <h5 className="font-medium text-sm mb-2">{event.title}</h5>
                          <p className="text-xs text-gray-500 mb-3">{event.currentParticipants || 0} participants</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendAnnouncement(event._id, "Event update")}
                            className="w-full"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send Update
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Moderate Feedback</h4>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">Review and moderate participant questions, comments, and feedback</p>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Feedback
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
