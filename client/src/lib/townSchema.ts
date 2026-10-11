import { z } from 'zod'

export const townSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Town name must be at least 2 characters')
    .max(60, 'Town name must be at most 60 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters'),
})

// The form's type comes from the schema, so they can never drift apart
export type TownFormValues = z.infer<typeof townSchema>