"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AcademicEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <CardTitle>Academic Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse all academic events here. More features coming soon!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
