export interface Event {
  _id?: string
  title: string
  description: string
  category: string
  department: string
  venue: string
  date: Date
  time: string
  endTime?: string
  maxParticipants?: number
  currentParticipants: number
  organizerId: string
  organizerName: string
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed"
  registrationDeadline: Date
  tags?: string[]
  requirements?: string[]
  prizes?: string[]
  contactInfo?: {
    email: string
    phone?: string
  }
  media?: {
    images: string[]
    videos: string[]
    documents: string[]
  }
  qrCode?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface EventRegistration {
  _id?: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  userDepartment: string
  registrationDate: Date
  status: "registered" | "cancelled" | "attended" | "no-show"
  attendanceTime?: Date
  qrCodeScanned?: boolean
  additionalInfo?: Record<string, any>
}
