"use client"

import { useState, useEffect } from "react"
import { EventCard } from "@/components/events/event-card"
import { EventFilters, type EventFilters as EventFiltersType } from "@/components/events/event-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar, Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Event } from "@/lib/models/Event"

interface EventsResponse {
  events: (Event & { _id: string })[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<(Event & { _id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState<EventFiltersType>({
    search: "",
    category: "all",
    department: "all",
    status: "approved",
    sortBy: "date",
    sortOrder: "asc",
  })
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";

  const fetchEvents = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(filters.department !== "all" && { department: filters.department }),
        ...(filters.status !== "all" && { status: filters.status }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      const response = await fetch(`/api/events?${params}`)
      if (response.ok) {
        const data: EventsResponse = await response.json()
        setEvents(data.events)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user.role)
      }
    } catch (error) {
      // User not logged in
      setUserRole("")
    }
  }

  useEffect(() => {
    fetchUserRole()
  }, [])

  useEffect(() => {
    fetchEvents(1)
  }, [filters, selectedCategory])

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchEvents(page)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                College Events
              </h1>
              <p className="text-gray-600 mt-1">Discover and participate in exciting college events</p>
            </div>

            {(userRole === "organizer" || userRole === "admin") && (
              <Button onClick={() => router.push("/events/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <EventFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new events.</p>
                  {(userRole === "organizer" || userRole === "admin") && (
                    <Button onClick={() => router.push("/events/create")}>Create First Event</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Results Summary */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    Showing {events.length} of {pagination.total} events
                  </p>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} userRole={userRole} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(
                        (page) => page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 2,
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Button
                            variant={pagination.page === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
