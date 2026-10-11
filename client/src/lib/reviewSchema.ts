import { z } from 'zod'
import { todayManila } from './dates'

export const reviewSchema = z.object({
  rating: z
    .number({ error: 'Please choose a rating' })
    .int()
    .min(1, 'Please choose a rating from 1 to 5')
    .max(5, 'Please choose a rating from 1 to 5'),
  comment: z
    .string()
    .trim()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be at most 1000 characters'),
  visitDate: z
    .string()
    .min(1, 'Visit date is required')
    .refine((d) => d <= todayManila(), 'Visit date cannot be in the future'),
})

// The form's type comes from the schema, so they can never drift apart
export type ReviewFormValues = z.infer<typeof reviewSchema>
