export interface GalleryMedia {
  _id?: string
  title: string
  description?: string
  category: 'academic' | 'career' | 'cultural' | 'social' | 'sports' | 'technical'
  imageUrl: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: Date
  isActive: boolean
  tags?: string[]
  eventId?: string // Optional link to specific event
  displayOrder?: number
  fileName?: string
  fileSize?: number
  mimeType?: string
}

export interface GalleryCategory {
  _id?: string
  name: string
  slug: string
  description?: string
  imageCount: number
  isActive: boolean
  displayOrder: number
}

export interface GalleryStats {
  totalImages: number
  imagesByCategory: {
    [key: string]: number
  }
  recentUploads: GalleryMedia[]
}