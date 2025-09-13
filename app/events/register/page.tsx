"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UpcomingEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events/upcoming") // adjust this to your API
        if (!res.ok) throw new Error("Failed to fetch events")
        const data = await res.json()
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="max-w-2xl w-full p-6">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Stay updated with the latest college events. Don’t miss out on exciting opportunities!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center">Loading events...</p>
          ) : events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event) => (
                <li
                  key={event._id}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-green-700">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()} — {event.location}
                  </p>
                  <p className="text-gray-700 mt-2">{event.description}</p>
                  <Link
                    href={`/events/${event._id}`}
                    className="inline-block mt-3 text-sm text-green-600 hover:underline"
                  >
                    View Details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No upcoming events right now.</p>
          )}

          {/* Back button */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition"
            >
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
