"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Settings, Download, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuickActionsProps {
  userRole: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter()

  const participantActions = [
    {
      icon: Calendar,
      label: "Browse Events",
      description: "Discover new events",
      onClick: () => router.push("/events"),
    },
    {
      icon: Download,
      label: "My Certificates",
      description: "Download certificates",
      onClick: () => router.push("/dashboard/certificates"),
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "View updates",
      onClick: () => router.push("/dashboard/notifications"),
    },
    {
      icon: Settings,
      label: "Profile Settings",
      description: "Update your profile",
      onClick: () => router.push("/dashboard/profile"),
    },
  ]

  const organizerActions = [
    {
      icon: Plus,
      label: "Create Event",
      description: "Organize new event",
      onClick: () => router.push("/events/create"),
    },
    {
      icon: Calendar,
      label: "My Events",
      description: "Manage your events",
      onClick: () => router.push("/organizer/events"),
    },
    {
      icon: Users,
      label: "Participants",
      description: "Manage registrations",
      onClick: () => router.push("/organizer/participants"),
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Account settings",
      onClick: () => router.push("/dashboard/profile"),
    },
  ]

  const actions = userRole === "participant" ? participantActions : organizerActions

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start bg-transparent"
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
