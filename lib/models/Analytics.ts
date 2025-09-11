export interface EventAnalytics {
  _id?: string
  eventId: string
  date: Date
  metrics: {
    views: number
    registrations: number
    cancellations: number
    attendance: number
    feedbackCount: number
    averageRating: number
  }
}

export interface UserAnalytics {
  _id?: string
  userId: string
  date: Date
  metrics: {
    eventsAttended: number
    eventsOrganized: number
    feedbackGiven: number
    certificatesEarned: number
    loginCount: number
  }
}

export interface SystemAnalytics {
  _id?: string
  date: Date
  metrics: {
    totalUsers: number
    activeUsers: number
    totalEvents: number
    completedEvents: number
    totalRegistrations: number
    averageEventRating: number
    systemUptime: number
  }
}
