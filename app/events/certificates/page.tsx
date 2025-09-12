"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function CertificatesPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login (replace with real authentication logic)
    setLoggedIn(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {!loggedIn ? (
            <>
              <form className="space-y-4 text-left" onSubmit={handleLogin}>
                <CardDescription className="mb-4 text-center">
                  Please log in to view your certificates.
                </CardDescription>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" name="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" required />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" id="password" name="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" required />
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-yellow-600 text-white font-semibold rounded-md shadow hover:bg-yellow-700 transition">Log In</button>
              </form>
            </>
          ) : (
            <CardDescription>
              Earn and download certificates for your participation and achievements. Your certificates will appear here once available.
            </CardDescription>
          )}
          {/* Back button */}
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
