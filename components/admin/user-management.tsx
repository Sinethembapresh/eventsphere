"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  userName: string
  userEmail: string
  role: string
  department?: string
  enrollmentNumber?: string
  institutionalId?: string
  phoneNumber?: string
  isApproved?: boolean
  isActive?: boolean
  createdAt?: string
  lastLogin?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== "all" && { role: filters.role }),
        ...(filters.status !== "all" && { status: filters.status }),
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Fetch users error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    setActionLoading(userId)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${action} successfully`,
        })
        fetchUsers()
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("User action error:", error)
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "organizer":
        return "bg-blue-100 text-blue-800"
      case "participant":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate user counts by role
  const userCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        
        {/* User Count Summary */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Participants: {userCounts.participant || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Organizers: {userCounts.organizer || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Admins: {userCounts.admin || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Total: {users.length}
            </span>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filters.role === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, role: "all" }))}
          >
            All Users
          </Button>
          <Button
            variant={filters.role === "participant" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, role: "participant" }))}
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Participants Only
          </Button>
          <Button
            variant={filters.role === "organizer" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, role: "organizer" }))}
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Organizers Only
          </Button>
          <Button
            variant={filters.role === "admin" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, role: "admin" }))}
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            Admins Only
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <Select value={filters.role} onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="participant">Participants</SelectItem>
              <SelectItem value="organizer">Organizers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.userName}
                          {user.role === "participant" && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Participant
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                        {user.enrollmentNumber && (
                          <div className="text-xs text-muted-foreground">ID: {user.enrollmentNumber}</div>
                        )}
                        {user.institutionalId && (
                          <div className="text-xs text-muted-foreground">Institution ID: {user.institutionalId}</div>
                        )}
                        {user.phoneNumber && (
                          <div className="text-xs text-muted-foreground">Phone: {user.phoneNumber}</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getRoleColor(user.role)} variant="secondary">
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell>{user.department || "-"}</TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                        {user.role === "organizer" && user.isApproved === false && (
                          <Badge variant="outline" className="text-yellow-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{formatDate(user.createdAt)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === "organizer" && user.isApproved === false && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user._id, "approved", { isApproved: true })}
                              disabled={actionLoading === user._id}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user._id, "rejected", { isActive: false })}
                              disabled={actionLoading === user._id}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUserAction(user._id, user.isActive !== false ? "deactivated" : "activated", {
                              isActive: user.isActive === false,
                            })
                          }
                          disabled={actionLoading === user._id}
                        >
                          {user.isActive !== false ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
