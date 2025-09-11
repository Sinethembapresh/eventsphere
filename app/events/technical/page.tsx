"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function TechnicalEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Technical Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse all technical events here. More features coming soon!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
