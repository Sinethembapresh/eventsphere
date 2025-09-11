export interface EventFeedback {
  _id?: string
  eventId: string
  userId: string
  userName: string
  rating: number // 1-5 stars
  comment?: string
  categories?: {
    organization: number
    content: number
    venue: number
    overall: number
  }
  isAnonymous: boolean
  createdAt: Date
  isModerated: boolean
  moderatorNotes?: string
}

export interface FeedbackSummary {
  eventId: string
  totalFeedbacks: number
  averageRating: number
  categoryAverages: {
    organization: number
    content: number
    venue: number
    overall: number
  }
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}
