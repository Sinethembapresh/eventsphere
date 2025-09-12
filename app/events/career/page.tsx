"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function CareerEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Career Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse all career events here. More features coming soon!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
