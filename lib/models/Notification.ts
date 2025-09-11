export interface Notification {
  _id?: string
  userId: string
  type:
    | "event_reminder"
    | "event_update"
    | "registration_confirmed"
    | "event_cancelled"
    | "system_announcement"
    | "certificate_ready"
  title: string
  message: string
  eventId?: string
  isRead: boolean
  priority: "low" | "medium" | "high" | "urgent"
  scheduledFor?: Date
  createdAt: Date
  expiresAt?: Date
}

export interface SystemAnnouncement {
  _id?: string
  title: string
  content: string
  type: "info" | "warning" | "success" | "error"
  targetRoles: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  expiresAt?: Date
}
