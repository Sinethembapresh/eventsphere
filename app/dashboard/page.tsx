"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentEvents } from "@/components/dashboard/recent-events"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Star, Clock, CheckCircle, AlertCircle, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardStats {
  registeredEvents?: number
  attendedEvents?: number
  upcomingEvents?: number
  feedbackGiven?: number
  totalEvents?: number
  approvedEvents?: number
  pendingEvents?: number
  completedEvents?: number
  totalRegistrations?: number
  averageRating?: number
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  department?: string
  enrollmentNumber?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      router.push("/auth/login")
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const renderParticipantStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Registered Events"
        value={stats.registeredEvents || 0}
        description="Currently registered"
        icon={Calendar}
        className="bg-blue-50 border-blue-200"
      />
      <StatsCard
        title="Attended Events"
        value={stats.attendedEvents || 0}
        description="Successfully attended"
        icon={CheckCircle}
        className="bg-green-50 border-green-200"
      />
      <StatsCard
        title="Upcoming Events"
        value={stats.upcomingEvents || 0}
        description="Events to attend"
        icon={Clock}
        className="bg-orange-50 border-orange-200"
      />
      <StatsCard
        title="Feedback Given"
        value={stats.feedbackGiven || 0}
        description="Reviews provided"
        icon={Star}
        className="bg-purple-50 border-purple-200"
      />
    </div>
  )

  const renderOrganizerStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Events"
        value={stats.totalEvents || 0}
        description="Events created"
        icon={Calendar}
        className="bg-blue-50 border-blue-200"
      />
      <StatsCard
        title="Approved Events"
        value={stats.approvedEvents || 0}
        description="Live events"
        icon={CheckCircle}
        className="bg-green-50 border-green-200"
      />
      <StatsCard
        title="Pending Approval"
        value={stats.pendingEvents || 0}
        description="Awaiting review"
        icon={AlertCircle}
        className="bg-yellow-50 border-yellow-200"
      />
      <StatsCard
        title="Average Rating"
        value={stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
        description="Event feedback"
        icon={Star}
        className="bg-purple-50 border-purple-200"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">Welcome to your EventSphere dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                {user.department && <p className="text-xs text-gray-600">{user.department}</p>}
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="mb-8">{user.role === "participant" ? renderParticipantStats() : renderOrganizerStats()}</div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentEvents userRole={user.role} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions userRole={user.role} />

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                {user.department && (
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-medium">{user.department}</p>
                  </div>
                )}
                {user.enrollmentNumber && (
                  <div>
                    <p className="text-xs text-gray-600">Enrollment Number</p>
                    <p className="text-sm font-medium">{user.enrollmentNumber}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Registered for Tech Workshop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Updated profile information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Downloaded certificate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
