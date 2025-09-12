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
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-")
    const newFilters = { 
      ...filters, 
      sortBy, 
      sortOrder 
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
    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Filter Events</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters} 
                className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              {showAdvanced ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events, organizers..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md text-gray-700 placeholder:text-gray-500"
          />
        </div>

        {/* Basic Filters */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="h-10 border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                {categories.map((category) => (
                  <SelectItem 
                    key={category.value} 
                    value={category.value}
                    className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="h-10 border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                {sortOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
              <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                <SelectTrigger className="h-10 border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                  {departments.map((dept) => (
                    <SelectItem 
                      key={dept.value} 
                      value={dept.value}
                      className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                    >
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="h-10 border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                  {statusOptions.map((status) => (
                    <SelectItem 
                      key={status.value} 
                      value={status.value}
                      className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                    >
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