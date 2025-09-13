"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Star, 
  Calendar, 
  Plus,
  CheckCircle,
  Clock
} from "lucide-react"
import { FeedbackForm } from "@/components/feedback/feedback-form"
import { FeedbackList } from "@/components/feedback/feedback-list"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Event {
  _id: string
  title: string
  date: string
  venue: string
  status: string
  category: string
  hasFeedback: boolean
}

export default function FeedbackPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view feedback options",
          variant: "destructive"
        })
        router.push("/auth/login")
        return
      }

      // Fetch events that the user has attended or registered for
      const response = await fetch("/api/dashboard/events", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        const eventsWithFeedbackStatus = await Promise.all(
          (data.events || []).map(async (event: any) => {
            // Check if user has already submitted feedback for this event
            const feedbackResponse = await fetch(`/api/feedback?eventId=${event._id}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include"
            })
            
            let hasFeedback = false
            if (feedbackResponse.ok) {
              const feedbackData = await feedbackResponse.json()
              hasFeedback = feedbackData.feedback && feedbackData.feedback.length > 0
            }
            
            return {
              ...event,
              hasFeedback
            }
          })
        )
        
        setEvents(eventsWithFeedbackStatus)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false)
    setSelectedEvent(null)
    fetchEvents() // Refresh the events list
  }

  const canSubmitFeedback = (event: Event) => {
    // Can submit feedback if event is completed and user hasn't already submitted
    const eventDate = new Date(event.date)
    const now = new Date()
    return eventDate < now && !event.hasFeedback
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Event Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Share your experience and help us improve future events
          </p>
        </div>

        {showFeedbackForm && selectedEvent ? (
          <FeedbackForm
            eventId={selectedEvent._id}
            eventTitle={selectedEvent.title}
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onCancel={() => {
              setShowFeedbackForm(false)
              setSelectedEvent(null)
            }}
          />
        ) : (
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="my-feedback">My Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Events Available for Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No events available for feedback</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div
                          key={event._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <Badge variant="outline">{event.category}</Badge>
                              {event.hasFeedback && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Feedback Submitted
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                              {event.venue && (
                                <div className="flex items-center gap-1">
                                  <span>{event.venue}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {canSubmitFeedback(event) ? (
                              <Button
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowFeedbackForm(true)
                                }}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Submit Feedback
                              </Button>
                            ) : event.hasFeedback ? (
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Event Not Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-feedback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    My Feedback History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackList showEventDetails={true} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}