"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SocialEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Social Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse all social events here. More features coming soon!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
