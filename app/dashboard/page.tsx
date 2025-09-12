"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-blue-600 text-lg">Loading dashboard...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-lg w-full text-center shadow-lg">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Please <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">log in</Link> to access your student dashboard.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role !== "participant") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-lg w-full text-center shadow-lg">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Only students can access this dashboard.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
      <Card className="max-w-2xl w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>Welcome, {user.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Manage your event registrations, certificates, participation history, and feedback here.
          </CardDescription>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/registrations">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>My Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>View and manage your event registrations.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/certificates">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>My Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Download certificates for attended events.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/history">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Participation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Track your event participation and attendance.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/feedback">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>My Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Submit and view feedback for events you've attended.</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
