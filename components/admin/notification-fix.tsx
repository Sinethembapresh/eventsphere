"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Users, Bell, CheckCircle, AlertCircle } from "lucide-react"

interface NotificationStatus {
  totalUsers: number
  totalDeadLineNotifications: number
  missingUsers: number
  missingUserIds: string[]
  allUsers: Array<{
    id: string
    name: string
    hasDeadLineNotification: boolean
  }>
  deadLineNotifications: Array<{
    id: string
    userId: string
    title: string
    createdAt: string
  }>
}

export function NotificationFix() {
  const [status, setStatus] = useState<NotificationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const { toast } = useToast()

  const checkStatus = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/test-notification-fix", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to check notification status",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check notification status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fixNotifications = async () => {
    try {
      setFixing(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/fix-notifications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message,
        })
        // Refresh status after fixing
        await checkStatus()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to fix notifications",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fix notifications",
        variant: "destructive"
      })
    } finally {
      setFixing(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Distribution Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
          {status && status.missingUsers > 0 && (
            <Button onClick={fixNotifications} disabled={fixing} variant="destructive">
              <Users className="h-4 w-4 mr-2" />
              Fix Missing Notifications ({status.missingUsers})
            </Button>
          )}
        </div>

        {status && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-lg font-semibold">{status.totalUsers}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Bell className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">DeadLine Notifications</p>
                  <p className="text-lg font-semibold">{status.totalDeadLineNotifications}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Missing Users</p>
                  <p className="text-lg font-semibold">{status.missingUsers}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {status.missingUsers === 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">All users have the DeadLine notification</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {status.missingUsers} users are missing the DeadLine notification
                  </span>
                </>
              )}
            </div>

            {/* User List */}
            <div className="space-y-2">
              <h3 className="font-medium">User Notification Status:</h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {status.allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{user.name}</span>
                    <Badge variant={user.hasDeadLineNotification ? "default" : "destructive"}>
                      {user.hasDeadLineNotification ? "Has Notification" : "Missing"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}