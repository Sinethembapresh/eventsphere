"use client"

import { useState, useEffect } from "react"
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, Users, Award, Clock, Bell, Settings, Camera, Activity, LogOut, MessageSquare 
} from "lucide-react"
import Link from "next/link"
import { EventCard } from "@/components/events/event-card"
import { ParticipantCertificates } from "@/components/certificates/participant-certificates"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardStats {
  totalRegistrations: number
  upcomingEvents: number
  certificatesEarned: number
  eventsAttended: number
}

interface RecentActivity {
  id: string
  type: 'registration' | 'attendance' | 'certificate' | 'feedback'
  title: string
  date: string
  status: string
}

export default function ParticipantDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    upcomingEvents: 0,
    certificatesEarned: 0,
    eventsAttended: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [bookmarkedEvents, setBookmarkedEvents] = useState<any[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // feedback state
  const [feedbackRating, setFeedbackRating] = useState<number>(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string>("")

  useEffect(() => {
    fetchDashboardData()
    fetchUpcomingEvents()
    fetchNotifications()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/dashboard/events", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setUpcomingEvents(data.events || [])
      }
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")

      try {
        const expressResponse = await fetch("http://localhost:3000/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (expressResponse.ok) console.log("Logged out via Express API")
      } catch {
        try {
          const nextResponse = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          })
          if (nextResponse.ok) console.log("Logged out via Next.js API")
        } catch (nextError) {
          console.error("Next.js API logout failed:", nextError)
        }
      }
    } finally {
      localStorage.removeItem("token")
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'token',
        newValue: null,
        storageArea: localStorage
      }))
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    }
  }

  const registerForEvent = async (eventId: string) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      toast({ title: "Registered", description: "You are registered for this event!" })
      fetchUpcomingEvents()
    }
  }

  const cancelRegistration = async (eventId: string) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`/api/events/${eventId}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      toast({ title: "Cancelled", description: "Your registration has been cancelled." })
      fetchUpcomingEvents()
    }
  }

  const toggleBookmark = (event: any) => {
    setBookmarkedEvents((prev) => {
      if (prev.find((e) => e._id === event._id)) {
        toast({ title: "Removed", description: "Event removed from bookmarks" })
        return prev.filter((e) => e._id !== event._id)
      } else {
        toast({ title: "Bookmarked", description: "Event saved to bookmarks" })
        return [...prev, event]
      }
    })
  }

  const handleSubmitFeedback = async () => {
    if (!selectedEvent || feedbackRating === 0) {
      toast({ title: "Missing Info", description: "Please select event and rating" })
      return
    }
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/events/${selectedEvent}/feedback`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment })
      })
      if (res.ok) {
        toast({ title: "Feedback Sent", description: "Thank you for your feedback!" })
        setFeedbackRating(0)
        setFeedbackComment("")
        setSelectedEvent("")
      }
    } catch (err) {
      console.error("Feedback failed:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Participant Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your event participation overview.</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-green-100 text-sm">Upcoming Events</p>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-purple-100 text-sm">Certificates</p>
                <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
              </div>
              <Award className="h-8 w-8 text-purple-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-orange-100 text-sm">Events Attended</p>
                <p className="text-2xl font-bold">{stats.eventsAttended}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/events">View All Events</Link>
                      </Button>
                    </div>
                  ) : <p className="text-gray-500 text-center py-4">No upcoming events</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.date}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{activity.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-500 text-center py-4">No recent activity</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  userRole="participant"
                  onRegister={() => registerForEvent(event._id)}
                  onCancel={() => cancelRegistration(event._id)}
                  onBookmark={() => toggleBookmark(event)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-medium">{n.title}</h4>
                          <p className="text-sm text-gray-600">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.read && <Badge variant="destructive" className="text-xs">New</Badge>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-center py-8">No notifications</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Event Feedback</CardTitle>
                <CardDescription>Send feedback for an event you attended</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Select Event</Label>
                <Select onValueChange={setSelectedEvent} value={selectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingEvents.map((event) => (
                      <SelectItem key={event._id} value={event._id}>{event.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Rating</Label>
                <Select onValueChange={(val) => setFeedbackRating(Number(val))} value={feedbackRating.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate 1-5 stars" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(r => (
                      <SelectItem key={r} value={r.toString()}>{r} ⭐</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Comment</Label>
                <Textarea 
                  placeholder="Write your feedback here..." 
                  value={feedbackComment} 
                  onChange={(e) => setFeedbackComment(e.target.value)} 
                />

                <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates">
            <ParticipantCertificates />
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Event Media & Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Saved photos & videos will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookmarks */}
          <TabsContent value="bookmarks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  userRole="participant"
                  onCancel={() => toggleBookmark(event)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
