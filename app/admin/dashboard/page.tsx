"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { UserManagement } from "@/components/admin/user-management"
import { EventApproval } from "@/components/admin/event-approval"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, TrendingUp, Star, AlertTriangle, Settings } from "lucide-react"

interface AdminAnalytics {
  users: {
    total: number
    active: number
    newThisMonth: number
    growth: number
    pendingOrganizers: number
  }
  events: {
    total: number
    approved: number
    pending: number
    completed: number
    thisMonth: number
  }
  registrations: {
    total: number
    thisMonth: number
    attendanceRate: number
  }
  feedback: {
    total: number
    averageRating: number
    thisMonth: number
  }
  distributions: {
    categories: Array<{ _id: string; count: number }>
    departments: Array<{ _id: string; count: number }>
  }
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and management</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={analytics.users.total}
            description={`${analytics.users.newThisMonth} new this month`}
            icon={Users}
            trend={{
              value: Math.round(analytics.users.growth),
              isPositive: analytics.users.growth >= 0,
            }}
            className="bg-blue-50 border-blue-200"
          />

          <StatsCard
            title="Active Events"
            value={analytics.events.approved}
            description={`${analytics.events.pending} pending approval`}
            icon={Calendar}
            className="bg-green-50 border-green-200"
          />

          <StatsCard
            title="Total Registrations"
            value={analytics.registrations.total}
            description={`${analytics.registrations.thisMonth} this month`}
            icon={TrendingUp}
            className="bg-orange-50 border-orange-200"
          />

          <StatsCard
            title="Average Rating"
            value={analytics.feedback.averageRating.toFixed(1)}
            description={`${analytics.feedback.total} total reviews`}
            icon={Star}
            className="bg-purple-50 border-purple-200"
          />
        </div>

        {/* Alert Cards */}
        {(analytics.users.pendingOrganizers > 0 || analytics.events.pending > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {analytics.users.pendingOrganizers > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-yellow-800">
                        {analytics.users.pendingOrganizers} Organizer{analytics.users.pendingOrganizers > 1 ? "s" : ""}{" "}
                        Awaiting Approval
                      </h3>
                      <p className="text-sm text-yellow-700">Review and approve new organizer accounts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analytics.events.pending > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-orange-800">
                        {analytics.events.pending} Event{analytics.events.pending > 1 ? "s" : ""} Pending Review
                      </h3>
                      <p className="text-sm text-orange-700">Review and approve submitted events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="events">Event Approval</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.distributions.categories.map((category) => (
                      <div key={category._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category._id}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(category.count / analytics.events.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.distributions.departments.slice(0, 6).map((dept) => (
                      <div key={dept._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept._id}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(dept.count / analytics.events.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{dept.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="events">
            <EventApproval />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User Growth Rate</span>
                    <span className="font-medium">{analytics.users.growth.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Event Completion Rate</span>
                    <span className="font-medium">
                      {analytics.events.total > 0
                        ? Math.round((analytics.events.completed / analytics.events.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className="font-medium">{analytics.registrations.attendanceRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Event Rating</span>
                    <span className="font-medium">{analytics.feedback.averageRating.toFixed(2)}/5</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Users</span>
                    <span className="font-medium">{analytics.users.newThisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Events</span>
                    <span className="font-medium">{analytics.events.thisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Registrations</span>
                    <span className="font-medium">{analytics.registrations.thisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Feedback</span>
                    <span className="font-medium">{analytics.feedback.thisMonth}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
