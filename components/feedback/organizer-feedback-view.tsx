"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageSquare, Calendar, MapPin, User, Eye, EyeOff, TrendingUp, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FeedbackItem {
  _id: string
  eventId: string
  userId: string
  userName: string
  rating: number
  comment?: string
  categories?: {
    organization: number
    content: number
    venue: number
    overall: number
  }
  isAnonymous: boolean
  createdAt: string
  event?: {
    _id: string
    title: string
    date: string
    venue: string
  }
}

interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  categoryAverages: {
    organization: number
    content: number
    venue: number
    overall: number
  }
}

interface OrganizerFeedbackViewProps {
  eventId?: string
}

export function OrganizerFeedbackView({ eventId }: OrganizerFeedbackViewProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>(eventId || "all")
  const [events, setEvents] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
    fetchFeedback()
  }, [selectedEvent])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/organizer/events", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    }
  }

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const params = new URLSearchParams()
      if (selectedEvent && selectedEvent !== "all") {
        params.append("eventId", selectedEvent)
      }

      const response = await fetch(`/api/feedback?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback || [])
        calculateStats(data.feedback || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch feedback")
      }
    } catch (error) {
      setError("Failed to fetch feedback")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (feedbackList: FeedbackItem[]) => {
    if (feedbackList.length === 0) {
      setStats(null)
      return
    }

    const totalFeedback = feedbackList.length
    const averageRating = feedbackList.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedback

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    feedbackList.forEach(fb => {
      ratingDistribution[fb.rating as keyof typeof ratingDistribution]++
    })

    const categoryAverages = {
      organization: 0,
      content: 0,
      venue: 0,
      overall: 0
    }

    if (feedbackList[0]?.categories) {
      Object.keys(categoryAverages).forEach(category => {
        const sum = feedbackList.reduce((acc, fb) => 
          acc + (fb.categories?.[category as keyof typeof fb.categories] || 0), 0)
        categoryAverages[category as keyof typeof categoryAverages] = sum / totalFeedback
      })
    }

    setStats({
      totalFeedback,
      averageRating,
      ratingDistribution,
      categoryAverages
    })
  }

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchFeedback} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Feedback Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchFeedback} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold">{stats.ratingDistribution[5]}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfaction Rate</p>
                  <p className="text-2xl font-bold">
                    {((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / stats.totalFeedback * 100).toFixed(0)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Averages */}
      {stats && stats.categoryAverages.organization > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Organization</p>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(stats.categoryAverages.organization), "sm")}
                </div>
                <p className="text-lg font-semibold">{stats.categoryAverages.organization.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Content</p>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(stats.categoryAverages.content), "sm")}
                </div>
                <p className="text-lg font-semibold">{stats.categoryAverages.content.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Venue</p>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(stats.categoryAverages.venue), "sm")}
                </div>
                <p className="text-lg font-semibold">{stats.categoryAverages.venue.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Overall</p>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(stats.categoryAverages.overall), "sm")}
                </div>
                <p className="text-lg font-semibold">{stats.categoryAverages.overall.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No feedback found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {item.event && (
                        <div className="mb-2">
                          <h3 className="font-semibold text-lg">{item.event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(item.event.date)}
                            </div>
                            {item.event.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {item.event.venue}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {item.isAnonymous ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-600">
                            {item.isAnonymous ? "Anonymous" : item.userName}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(item.createdAt)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {renderStars(item.rating, "sm")}
                        <span className="text-sm font-medium">{item.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  {item.comment && (
                    <div className="mb-3">
                      <p className="text-gray-700 leading-relaxed">{item.comment}</p>
                    </div>
                  )}
                  
                  {item.categories && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-600">Organization</p>
                        {renderStars(item.categories.organization, "sm")}
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">Content</p>
                        {renderStars(item.categories.content, "sm")}
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">Venue</p>
                        {renderStars(item.categories.venue, "sm")}
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">Overall</p>
                        {renderStars(item.categories.overall, "sm")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}