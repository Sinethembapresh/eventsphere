"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsLoggedIn(false)
          setUser(null)
          setLoading(false)
          return
        }

        // If we have a token, show user as logged in immediately
        // This ensures the logout button appears even if APIs are slow
        setUser({ name: "User", role: "participant" })
        setIsLoggedIn(true)

        // Try to verify with Express API first (since that's where the token comes from)
        try {
          const expressResponse = await fetch("http://localhost:3000/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (expressResponse.ok) {
            const userData = await expressResponse.json()
            setUser(userData.data?.user || userData.user)
            setIsLoggedIn(true)
            setLoading(false)
            return
          }
        } catch (expressError) {
          // Express API not available, continue to Next.js API
        }

        // Fallback to Next.js API
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          setIsLoggedIn(true)
        } else {
          // Both APIs failed, but keep user logged in for logout functionality
          setUser({ name: "User", role: "participant" })
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("token")
        setIsLoggedIn(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuthStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Try Express API logout first
      try {
        const expressResponse = await fetch("http://localhost:3000/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        
        if (expressResponse.ok) {
          console.log("Logged out via Express API")
        }
      } catch (expressError) {
        console.log("Express API not available, trying Next.js API")
        
        // Fallback to Next.js API
        try {
          const nextResponse = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          })
          
          if (nextResponse.ok) {
            console.log("Logged out via Next.js API")
          }
        } catch (nextError) {
          console.error("Next.js API logout failed:", nextError)
        }
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local storage and state regardless of API response
      localStorage.removeItem("token")
      setIsLoggedIn(false)
      setUser(null)
      
      // Trigger storage event to update other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'token',
        newValue: null,
        storageArea: localStorage
      }))
      
      // Show success message
      console.log("Successfully logged out")
      
      // Redirect to home page
      router.push("/")
    }
  }

  const getDashboardLink = () => {
    if (!user) return "/dashboard"
    
    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "organizer":
        return "/organizer/dashboard"
      case "participant":
        return "/dashboard"
      default:
        return "/dashboard"
    }
  }

  if (loading) {
    return (
      <header className="fixed top-0 left-0 w-full z-30 bg-white/70 backdrop-blur-md shadow-sm border-b border-blue-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text">
            EventSphere
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">Home</Link>
            <Link href="/events" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">Events</Link>
            <Link href="/gallery" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">Gallery</Link>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-white/70 backdrop-blur-md shadow-sm border-b border-blue-100">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text">
          EventSphere
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">Home</Link>
          <Link href="/events" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">Events</Link>
          <Link href="/gallery" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">Gallery</Link>
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-blue-700 hover:text-pink-500 transition">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.name || user?.userName || user?.email || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className="text-base font-medium text-blue-700 hover:text-pink-500 transition">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}