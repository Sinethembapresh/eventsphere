"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function CulturalEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Cultural Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse all cultural events here. More features coming soon!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
