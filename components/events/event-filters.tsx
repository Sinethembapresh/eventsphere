"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void
  initialFilters?: EventFilters
}

export interface EventFilters {
  search: string
  category: string
  department: string
  status: string
  sortBy: string
  sortOrder: string
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Technical", label: "Technical" },
  { value: "Cultural", label: "Cultural" },
  { value: "Sports", label: "Sports" },
  { value: "Academic", label: "Academic" },
  { value: "Social", label: "Social" },
  { value: "Career", label: "Career" },
]

const departments = [
  { value: "all", label: "All Departments" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Electronics & Communication", label: "Electronics & Communication" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "Business Administration", label: "Business Administration" },
  { value: "Commerce", label: "Commerce" },
  { value: "Arts & Humanities", label: "Arts & Humanities" },
]

const statusOptions = [
  { value: "approved", label: "Approved Events" },
  { value: "pending", label: "Pending Approval" },
  { value: "completed", label: "Completed Events" },
  { value: "all", label: "All Status" },
]

const sortOptions = [
  { value: "date-asc", label: "Date (Earliest First)" },
  { value: "date-desc", label: "Date (Latest First)" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "created-desc", label: "Recently Added" },
]

export function EventFilters({ onFiltersChange, initialFilters }: EventFiltersProps) {
  const [filters, setFilters] = useState<EventFilters>(
    initialFilters || {
      search: "",
      category: "all",
      department: "all",
      status: "approved",
      sortBy: "date",
      sortOrder: "asc",
    },
  )

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }

    // Handle sort options
    if (key === "sort") {
      const [sortBy, sortOrder] = value.split("-")
      newFilters.sortBy = sortBy
      newFilters.sortOrder = sortOrder
    }

    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: EventFilters = {
      search: "",
      category: "all",
      department: "all",
      status: "approved",
      sortBy: "date",
      sortOrder: "asc",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.search || filters.category !== "all" || filters.department !== "all" || filters.status !== "approved"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filter Events</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? "Less" : "More"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, organizers..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
