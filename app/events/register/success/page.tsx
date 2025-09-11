"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"
import Link from "next/link"

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle>Registration Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Thank you for registering for the event. You will receive a confirmation email shortly.<br />
            We look forward to seeing you there!
          </CardDescription>
          <div className="mt-8">
            <Link href="/events" className="inline-block px-6 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition">
              Back to Events
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
