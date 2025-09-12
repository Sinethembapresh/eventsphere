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
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || "all"

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
    } catch {
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <Calendar className="h-9 w-9 text-blue-600" />
              College Events
            </h1>
            <p className="text-lg text-gray-500">Discover and join exciting campus events</p>
          </div>
          {(userRole === "organizer" || userRole === "admin") && (
            <Button 
              onClick={() => router.push("/events/create")} 
              className="bg-blue-600 hover:bg-blue-700 transition-colors self-start sm:self-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <EventFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
            </div>
          </aside>

          {/* Events Section */}
          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-24 bg-white rounded-xl shadow-sm">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-600">Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-xl bg-white">
                <CardContent className="text-center py-20">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No events found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or check back later for new events.
                  </p>
                  {(userRole === "organizer" || userRole === "admin") && (
                    <Button 
                      onClick={() => router.push("/events/create")}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Create First Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Results Summary */}
                <p className="text-sm text-gray-500 font-medium">
                  Showing {events.length} of {pagination.total} events
                </p>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      userRole={userRole} 
                      className="transition-transform hover:scale-[1.02] duration-200"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-6">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="border-gray-200 hover:bg-gray-100 text-gray-700 font-medium"
                    >
                      Previous
                    </Button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.pages ||
                          Math.abs(page - pagination.page) <= 2
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-3 text-gray-400">...</span>
                          )}
                          <Button
                            variant={pagination.page === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            className={`
                              min-w-[44px] font-medium
                              ${pagination.page === page 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "border-gray-200 hover:bg-gray-100 text-gray-700"}
                            `}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="border-gray-200 hover:bg-gray-100 text-gray-700 font-medium"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}