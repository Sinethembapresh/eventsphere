"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Search, Filter, X } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays } from "date-fns"

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void
  onSearch: (query: string) => void
  initialFilters?: EventFilters
}

export interface EventFilters {
  search: string
  category: string
  department: string
  venue: string
  dateRange: { from: Date; to: Date } | undefined
  maxParticipants: string
  status: string
  sortBy: string
  sortOrder: string
  tags: string[]
}

const categories = [
  "Technical", "Cultural", "Sports", "Academic", "Social", "Career"
]

const departments = [
  "Computer Science", "Electronics", "Mechanical", "Civil", 
  "Electrical", "Chemical", "Management", "All"
]

const venues = [
  "Auditorium", "Seminar Hall", "Lab", "Sports Complex", 
  "Library", "Cafeteria", "Outdoor", "All"
]

const statusOptions = [
  "approved", "pending", "completed", "cancelled"
]

export function EventFilters({ onFiltersChange, onSearch, initialFilters }: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || "")
  const [filters, setFilters] = useState<EventFilters>({
    search: initialFilters?.search || "",
    category: initialFilters?.category || "",
    department: initialFilters?.department || "",
    venue: initialFilters?.venue || "",
    dateRange: initialFilters?.dateRange || undefined,
    maxParticipants: initialFilters?.maxParticipants || "",
    status: initialFilters?.status || "",
    sortBy: initialFilters?.sortBy || "date",
    sortOrder: initialFilters?.sortOrder || "asc",
    tags: initialFilters?.tags || []
  })

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearch = () => {
    onSearch(searchQuery)
  }

  const clearFilters = () => {
    const clearedFilters: EventFilters = {
      search: "",
      category: "",
      department: "",
      venue: "",
      dateRange: undefined,
      maxParticipants: "",
      status: "",
      sortBy: "date",
      sortOrder: "asc",
      tags: []
    }
    setFilters(clearedFilters)
    setSearchQuery("")
    onFiltersChange(clearedFilters)
    onSearch("")
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== "" && value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Events
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} filters</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isOpen ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search events by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={filters.category === category ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => handleFilterChange("category", 
                filters.category === category ? "" : category
              )}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Advanced Filters */}
        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Venue Filter */}
            <div className="space-y-2">
              <Label>Venue</Label>
              <Select value={filters.venue} onValueChange={(value) => handleFilterChange("venue", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Venues</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue} value={venue}>
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range: any) => handleFilterChange("dateRange", range)}
              />
            </div>

            {/* Max Participants Filter */}
            <div className="space-y-2">
              <Label>Max Participants</Label>
              <Select value={filters.maxParticipants} onValueChange={(value) => handleFilterChange("maxParticipants", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Size</SelectItem>
                  <SelectItem value="small">Small (1-50)</SelectItem>
                  <SelectItem value="medium">Medium (51-200)</SelectItem>
                  <SelectItem value="large">Large (200+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By Filter */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order Filter */}
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Filter Actions */}
        {isOpen && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
            <div className="text-sm text-gray-500">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}