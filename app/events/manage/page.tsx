"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { toast } from "sonner"

export default function EventManagementPage() {
  const [role, setRole] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching user role (replace with real API call)
    async function fetchRole() {
      setLoading(true)
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setRole(data.user.role)
        } else {
          throw new Error('Failed to fetch user role')
        }
      } catch (error) {
        console.error('Auth error:', error)
        toast.error('Failed to verify permissions')
        setRole("")
      } finally {
        setLoading(false)
      }
    }
    fetchRole()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-purple-600 text-lg">Checking access...</span>
      </div>
    )
  }

  if (role !== "admin" && role !== "organizer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-lg w-full text-center shadow-lg">
          <CardHeader>
            <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              You do not have permission to access event management tools. Please contact your administrator if you need access.
            </CardDescription>
            <div className="mt-8 text-center">
              <Link href="/" className="inline-block px-6 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
      <h1 className="text-2xl text-purple-600">Welcome to Event Management</h1>
    </div>
  )
}
