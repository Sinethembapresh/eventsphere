import { ObjectId } from "mongodb"

export interface CertificateTemplate {
  _id?: ObjectId
  name: string
  description?: string
  templateUrl: string
  eventId?: string
  organizerId: string
  organizerName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Certificate {
  _id?: ObjectId
  certificateId: string // Unique identifier for the certificate
  eventId: string
  eventTitle: string
  participantId: string
  participantName: string
  participantEmail: string
  participantDepartment?: string
  templateId: string
  templateUrl: string
  issuedAt: Date
  issuedBy: string // Organizer ID
  issuedByName: string // Organizer name
  status: 'issued' | 'downloaded' | 'revoked'
  downloadCount: number
  lastDownloadedAt?: Date
  verificationCode: string // For certificate verification
  metadata?: {
    eventDate?: Date
    eventVenue?: string
    eventCategory?: string
    participantRole?: string
    customFields?: Record<string, any>
  }
}

export interface CertificateVerification {
  _id?: ObjectId
  certificateId: string
  participantId: string
  eventId: string
  verifiedAt: Date
  verifiedBy?: string
  ipAddress?: string
  userAgent?: string
}
