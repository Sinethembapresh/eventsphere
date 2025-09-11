export interface MediaFile {
  _id?: string
  eventId: string
  fileName: string
  originalName: string
  fileType: "image" | "video" | "document" | "certificate"
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: Date
  isPublic: boolean
  tags?: string[]
  description?: string
}

export interface Certificate {
  _id?: string
  eventId: string
  userId: string
  userName: string
  certificateType: "participation" | "completion" | "achievement"
  templateId?: string
  certificateUrl: string
  generatedAt: Date
  downloadCount: number
  isValid: boolean
}
