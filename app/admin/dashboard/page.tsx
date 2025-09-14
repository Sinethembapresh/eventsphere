"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UserManagement } from "@/components/admin/user-management";
import { EventApproval } from "@/components/admin/event-approval";

import { NotificationFix } from "@/components/admin/notification-fix";
import GalleryManagement from "@/components/admin/gallery-management";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  TrendingUp,
  Star,
  Image as ImageIcon,
  MessageSquare,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";

interface AdminAnalytics {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
    pendingOrganizers: number;
  };
  events: {
    total: number;
    approved: number;
    pending: number;
    completed: number;
    thisMonth: number;
  };
  registrations: {
    total: number;
    thisMonth: number;
    attendanceRate: number;
  };
  feedback: {
    total: number;
    averageRating: number;
    thisMonth: number;
  };
  media?: {
    total: number;
  };
  distributions: {
    categories: Array<{ _id: string; count: number }>;
    departments: Array<{ _id: string; count: number }>;
  };
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("/api/admin/analytics", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to fetch analytics");
      }
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      setError("No analytics data available yet.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Try Express API logout first
      try {
        const expressResponse = await fetch("http://localhost:3000/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (expressResponse.ok) {
          console.log("Logged out via Express API");
        }
      } catch (expressError) {
        console.log("Express API not available, trying Next.js API");
        
        // Fallback to Next.js API
        try {
          const nextResponse = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (nextResponse.ok) {
            console.log("Logged out via Next.js API");
          }
        } catch (nextError) {
          console.error("Next.js API logout failed:", nextError);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and state regardless of API response
      localStorage.removeItem("token");
      
      // Trigger storage event to update other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'token',
        newValue: null,
        storageArea: localStorage
      }));
      
      // Show success message
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to home page
      router.push("/");
    }
  };

  // Default fallback data so UI still renders
  const safeAnalytics: AdminAnalytics = analytics || {
    users: {
      total: 0,
      active: 0,
      newThisMonth: 0,
      growth: 0,
      pendingOrganizers: 0,
    },
    events: {
      total: 0,
      approved: 0,
      pending: 0,
      completed: 0,
      thisMonth: 0,
    },
    registrations: {
      total: 0,
      thisMonth: 0,
      attendanceRate: 0,
    },
    feedback: {
      total: 0,
      averageRating: 0,
      thisMonth: 0,
    },
    distributions: {
      categories: [],
      departments: [],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                System overview and management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
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
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700">
              ⚠️ {error}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={safeAnalytics.users.total}
              description={`${safeAnalytics.users.newThisMonth} new this month`}
              icon={Users}
              trend={{
                value: Math.round(safeAnalytics.users.growth),
                isPositive: safeAnalytics.users.growth >= 0,
              }}
              className="bg-blue-50 border-blue-200"
            />

            <StatsCard
              title="Events"
              value={safeAnalytics.events.total}
              description={`${safeAnalytics.events.approved} approved`}
              icon={Calendar}
              className="bg-green-50 border-green-200"
            />

            <StatsCard
              title="Media"
              value={safeAnalytics.media?.total || 0}
              description={`total media assets`}
              icon={ImageIcon}
              className="bg-orange-50 border-orange-200"
            />

            <StatsCard
              title="Feedback"
              value={safeAnalytics.feedback.total}
              description={`total reviews`}
              icon={MessageSquare}
              className="bg-purple-50 border-purple-200"
            />
          </div>

          {/* Alert Cards */}
          {(safeAnalytics.users.pendingOrganizers > 0 ||
            safeAnalytics.events.pending > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {safeAnalytics.users.pendingOrganizers > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h3 className="font-medium text-yellow-800">
                          {safeAnalytics.users.pendingOrganizers} Organizer
                          {safeAnalytics.users.pendingOrganizers > 1
                            ? "s"
                            : ""}{" "}
                          Awaiting Approval
                        </h3>
                        <p className="text-sm text-yellow-700">
                          Review and approve new organizer accounts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {safeAnalytics.events.pending > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <div>
                          <h3 className="font-medium text-orange-800">
                            {safeAnalytics.events.pending} Event
                            {safeAnalytics.events.pending > 1 ? "s" : ""} Pending
                            Review
                          </h3>
                          <p className="text-sm text-orange-700">
                            Review and approve submitted events
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-orange-300 text-orange-800 hover:bg-orange-100"
                        onClick={() => {
                          const eventsTab = document.querySelector('[value="events"]') as HTMLElement
                          eventsTab?.click()
                        }}
                      >
                        Review Events
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">

            <TabsList className="grid w-full grid-cols-6">

              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="events">Event Approval</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>

              <TabsTrigger value="notifications">Notifications</TabsTrigger>

              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Pending Events Quick View */}
              {safeAnalytics.events.pending > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Pending Events ({safeAnalytics.events.pending})
                    </CardTitle>
                    <p className="text-sm text-orange-700">
                      Events awaiting your approval. Click "Review Events" tab to manage them.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="border-orange-300 text-orange-800 hover:bg-orange-100"
                      onClick={() => {
                        const eventsTab = document.querySelector('[value="events"]') as HTMLElement
                        eventsTab?.click()
                      }}
                    >
                      Review All Pending Events
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {safeAnalytics.distributions.categories.length > 0 ? (
                      <div className="space-y-3">
                        {safeAnalytics.distributions.categories.map(
                          (category) => (
                            <div
                              key={category._id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm font-medium">
                                {category._id}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        safeAnalytics.events.total > 0
                                          ? (category.count /
                                              safeAnalytics.events.total) *
                                            100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-muted-foreground w-8">
                                  {category.count}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No category data available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Department Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Department Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {safeAnalytics.distributions.departments.length > 0 ? (
                      <div className="space-y-3">
                        {safeAnalytics.distributions.departments
                          .slice(0, 6)
                          .map((dept) => (
                            <div
                              key={dept._id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm font-medium">
                                {dept._id}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        safeAnalytics.events.total > 0
                                          ? (dept.count /
                                              safeAnalytics.events.total) *
                                            100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-muted-foreground w-8">
                                  {dept.count}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No department data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                  <p className="text-gray-600 mt-1">Review, approve, and manage all events</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    {safeAnalytics.events.pending} Pending
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {safeAnalytics.events.approved} Approved
                  </Badge>
                </div>
              </div>
              <EventApproval />
            </TabsContent>


            <TabsContent value="gallery" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="h-6 w-6" />
                    Gallery Management
                  </h2>
                  <p className="text-gray-600 mt-1">Upload and manage gallery images by category</p>
                </div>
              </div>
              <GalleryManagement />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="h-6 w-6" />
                    Notification Management
                  </h2>
                  <p className="text-gray-600 mt-1">Fix notification distribution and manage system notifications</p>
                </div>
              </div>
              <NotificationFix />

            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        User Growth Rate
                      </span>
                      <span className="font-medium">
                        {safeAnalytics.users.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Event Completion Rate
                      </span>
                      <span className="font-medium">
                        {safeAnalytics.events.total > 0
                          ? Math.round(
                              (safeAnalytics.events.completed /
                                safeAnalytics.events.total) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Attendance Rate
                      </span>
                      <span className="font-medium">
                        {safeAnalytics.registrations.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Average Event Rating
                      </span>
                      <span className="font-medium">
                        {safeAnalytics.feedback.averageRating.toFixed(2)}/5
                      </span>
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
                      <span className="font-medium">
                        {safeAnalytics.users.newThisMonth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Events</span>
                      <span className="font-medium">
                        {safeAnalytics.events.thisMonth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        New Registrations
                      </span>
                      <span className="font-medium">
                        {safeAnalytics.registrations.thisMonth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        New Feedback
                      </span>
                      <span className="font-medium">
                        {safeAnalytics.feedback.thisMonth}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
