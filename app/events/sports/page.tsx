"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SportsEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Sports Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse all sports events here. More features coming soon!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
