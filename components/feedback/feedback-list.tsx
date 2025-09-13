"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Calendar, MapPin, User, Eye, EyeOff } from "lucide-react"
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

interface FeedbackListProps {
  userId?: string
  eventId?: string
  showEventDetails?: boolean
}

export function FeedbackList({ userId, eventId, showEventDetails = true }: FeedbackListProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchFeedback()
  }, [userId, eventId])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const params = new URLSearchParams()
      if (eventId) params.append("eventId", eventId)
      if (userId) params.append("userId", userId)

      const response = await fetch(`/api/feedback?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback || [])
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

  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No feedback found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item._id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                {showEventDetails && item.event && (
                  <div>
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
          </CardHeader>
          
          {item.comment && (
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">{item.comment}</p>
            </CardContent>
          )}
          
          {item.categories && (
            <CardContent className="pt-0">
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
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}