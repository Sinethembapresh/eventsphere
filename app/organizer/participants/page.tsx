"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OrganizerParticipantsPage() {
  const router = useRouter()
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Participants</h1>
        <Button variant="outline" onClick={() => router.push("/organizer/dashboard")}>Back to Dashboard</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participants Management</CardTitle>
        </CardHeader>
        <CardContent>
          This page will list participants for your events. Select an event to view or manage its participants.
        </CardContent>
      </Card>
    </div>
  )
}
