"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Users, 
  Award, 
  Clock, 
  Bell, 
  Settings, 
  Search,
  Filter,
  Download,
  Share2,
  Bookmark,
  Star,
  Camera,
  QrCode,
  TrendingUp,
  Activity
} from "lucide-react"
import Link from "next/link"
import { EventCard } from "@/components/events/event-card"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()

  useEffect(() => {
    // Fetch dashboard data
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

  const handleQuickAction = (action: string) => {
    toast({
      title: "Quick Action",
      description: `${action} feature coming soon!`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Participant Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your event participation overview.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Registrations</p>
                  <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                </div>
                <Clock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Certificates</p>
                  <p className="text-2xl font-bold">{stats.certificatesEarned}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Events Attended</p>
                  <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
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
                  ) : (
                    <p className="text-gray-500 text-center py-4">No upcoming events</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
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
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleQuickAction("QR Check-in")}>
                    <QrCode className="h-6 w-6" />
                    <span className="text-sm">QR Check-in</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleQuickAction("Search Events")}>
                    <Search className="h-6 w-6" />
                    <span className="text-sm">Search Events</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleQuickAction("Download Certificates")}>
                    <Download className="h-6 w-6" />
                    <span className="text-sm">Certificates</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleQuickAction("Share Events")}>
                    <Share2 className="h-6 w-6" />
                    <span className="text-sm">Share Events</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Events
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved Events
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} userRole="participant" />
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                        {!notification.read && <Badge variant="destructive" className="text-xs">New</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No notifications</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  My Certificates
                </CardTitle>
                <CardDescription>Download certificates for events you've attended</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                  <p className="text-gray-500 mb-4">Attend events to earn certificates</p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
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
                  Event Media & Gallery
                </CardTitle>
                <CardDescription>View and save event photos and videos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No media available</h3>
                  <p className="text-gray-500 mb-4">Event galleries will appear here after attending events</p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Management
                </CardTitle>
                <CardDescription>Manage your profile and account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Profile Information</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Name: John Doe</p>
                      <p className="text-sm text-gray-600">Email: john.doe@college.edu</p>
                      <p className="text-sm text-gray-600">Department: Computer Science</p>
                      <p className="text-sm text-gray-600">Enrollment: CS2024001</p>
                    </div>
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Account Settings</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Notification Preferences
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Bell className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Share2 className="h-4 w-4 mr-2" />
                        Social Integration
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
