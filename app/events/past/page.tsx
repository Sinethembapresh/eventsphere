"use client"

import { useState, useEffect } from "react"
import { EventCard } from "@/components/events/event-card"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import type { Event } from "@/lib/models/Event"
import Link from "next/link"

interface EventsResponse {
  events: (Event & { _id: string })[]
}

export default function PastEventsPage() {
  const [events, setEvents] = useState<(Event & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPastEvents = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/events?status=past&sortBy=date&sortOrder=desc")
        if (response.ok) {
          const data: EventsResponse = await response.json()
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Failed to fetch past events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPastEvents()
  }, [])

  // Group events by category
  const groupedEvents = events.reduce((acc, event) => {
    const category = event.category || "Other"
    if (!acc[category]) acc[category] = []
    acc[category].push(event)
    return acc
  }, {} as Record<string, (Event & { _id: string })[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Past Events</h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore memorable events that have already taken place at your college. See highlights, photos, and more!
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-blue-600 text-xl">Loading past events...</span>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No past events found</h3>
              <p className="text-gray-600 mb-4">Check back later for more updates.</p>
              {/* Back button */}
              <div className="mt-8 text-center">
                <Link href="/" className="inline-block px-6 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition">
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedEvents).map(([category, events]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-left mb-4 text-blue-700">{category} Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} userRole={"guest"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
