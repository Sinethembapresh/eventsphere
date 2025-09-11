export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "normal" | "participant" | "organizer" | "admin"
  department?: string
  enrollmentNumber?: string
  institutionalId?: string
  isApproved?: boolean
  twoFactorEnabled?: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface UserProfile {
  userId: string
  avatar?: string
  bio?: string
  phone?: string
  year?: string
  interests?: string[]
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
}
