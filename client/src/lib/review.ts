export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type Review = {
  _id: string
  rating: number
  comment: string
  visitDate: string
  status: ReviewStatus
  createdAt: string
  user?: { _id: string; name: string }
  restaurant?: { _id: string; name: string; town?: string; area?: string; imageUrl?: string }
}
