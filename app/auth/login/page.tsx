"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsCheckingAuth(false)
          return
        }

        // Clear any pending event join since we're going to dashboard
        localStorage.removeItem("pendingEventJoin")

        // Try Express API first
        try {
          const expressResponse = await fetch("http://localhost:3000/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (expressResponse.ok) {
            const userData = await expressResponse.json()
            const user = userData.data?.user || userData.user
            
            if (user) {
              // User is already logged in, redirect to appropriate dashboard
              const redirectUrl = getDashboardUrl(user.role)
              router.replace(redirectUrl)
              return
            }
          }
        } catch (expressError) {
          // Express API not available, try Next.js API
        }

        // Fallback to Next.js API
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          })
          
          if (response.ok) {
            const userData = await response.json()
            const user = userData.user
            
            if (user) {
              // User is already logged in, redirect to appropriate dashboard
              const redirectUrl = getDashboardUrl(user.role)
              router.replace(redirectUrl)
              return
            }
          }
        } catch (nextError) {
          // Both APIs failed, but keep user on login page
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [router])

  const getDashboardUrl = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard"
      case "organizer":
        return "/organizer/dashboard"
      case "participant":
        return "/dashboard"
      default:
        return "/events"
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text mb-2">EventSphere</h1>
          <p className="text-gray-600">College Event Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
