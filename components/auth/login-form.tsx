"use client"

import type React from "react"
import axiosInstance from "../../app/api/axiosInstance"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function LoginForm() {
  const [formData, setFormData] = useState({
    userEmail: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  try {
    // Try Express API first (port 3000)
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: formData.userEmail,
        password: formData.password,
      }),
      
    })

    const data = await res.json()

    if (res.ok && data.success && data.data?.user) {
      // Store token in localStorage for axiosInstance
      if (data.data.accessToken) {
        localStorage.setItem("token", data.data.accessToken)
      }


      // Redirect based on user role
      switch (data.data.user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "organizer":
          router.push("/organizer/dashboard")
          break
        case "participant":
          router.push("/dashboard")
          break
        default:
          router.push("/events")
      }
    } else {
      setError(data.message || "Login failed")
    }
  } catch (error: any) {
    setError("Network error. Please try again.")
  } finally {
    setIsLoading(false)
  }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your EventSphere account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input
              id="userEmail"
              name="userEmail"
              type="email"
              placeholder="your.email@college.edu"
              value={formData.userEmail}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Button
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={() => router.push("/auth/register")}
          >
            Sign up here
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
