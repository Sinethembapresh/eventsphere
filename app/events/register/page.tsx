"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"
import Link from "next/link"

export default function RegisterEventPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
        
          <CardTitle>Easy Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Welcome! Register for your favorite college events below. Enjoy a fast, paperless process and get instant confirmation.
          </CardDescription>
          <form className="mt-8 space-y-4 text-left">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" id="name" name="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
            </div>
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700">Select Event</label>
              <select id="event" name="event" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required>
                <option value="">Choose an event...</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Social">Social</option>
                <option value="Career">Career</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition">Register</button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/auth/register" className="inline-block text-sm text-green-600 hover:underline">
              Or create an account
            </Link>
          </div>
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
