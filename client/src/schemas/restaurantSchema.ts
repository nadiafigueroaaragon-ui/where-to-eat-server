import { z } from 'zod'
import type { RestaurantPayload, RestaurantRecord } from '../api/restaurants'

export const CUISINES = [
  'Kapampangan/Filipino',
  'Asian',
  'Western/Italian',
  'Mexican',
  'Mediterranean',
  'Cafe/Bakery',
] as const

export const DINING_TYPES = [
  'fine dining',
  'casual dining',
  'buffet',
  'cafe/bakery',
  'resto bar',
] as const

export const PRICE_LEVELS = ['cheap', 'moderate', 'expensive'] as const

export const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export const FALLBACK_TOWNS = ['Angeles City', 'San Fernando', 'Magalang', 'Mabalacat']

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

const dayHours = z.object({
  closed: z.boolean(),
  open: z.string(),
  close: z.string(),
})

export const restaurantSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    town: z.string().min(1, 'Choose a town'),
    area: z.string().trim().max(60, 'Area is too long').optional(),
    address: z.string().trim().min(5, 'Enter the full address').max(200, 'Address is too long'),
    latitude: z
      .number({ error: 'Enter a number' })
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: z
      .number({ error: 'Enter a number' })
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
    cuisine: z.enum(CUISINES, { error: 'Choose a cuisine' }),
    diningType: z.enum(DINING_TYPES, { error: 'Choose a dining type' }),
    priceLevel: z.enum(PRICE_LEVELS, { error: 'Choose a price level' }),
    averageMealCost: z.number({ error: 'Enter a number' }).min(0, 'Cost cannot be negative'),
    seatsPerSlot: z
      .number({ error: 'Enter a number' })
      .int('Use a whole number')
      .min(1, 'At least 1 seat')
      .max(500, 'Maximum is 500 seats'),
    description: z.string().trim().max(500, 'Keep it under 500 characters').optional(),
    images: z.string().optional(),
    hours: z.object({
      monday: dayHours,
      tuesday: dayHours,
      wednesday: dayHours,
      thursday: dayHours,
      friday: dayHours,
      saturday: dayHours,
      sunday: dayHours,
    }),
  })
  .superRefine((val, ctx) => {
    for (const day of DAYS) {
      const h = val.hours[day]
      if (h.closed) continue
      if (!TIME.test(h.open)) {
        ctx.addIssue({ code: 'custom', path: ['hours', day, 'open'], message: 'Set an opening time' })
      }
      if (!TIME.test(h.close)) {
        ctx.addIssue({ code: 'custom', path: ['hours', day, 'close'], message: 'Set a closing time' })
      }
    }
  })

export type RestaurantFormValues = z.infer<typeof restaurantSchema>

const emptyDay = { closed: false, open: '10:00', close: '21:00' }

export const emptyFormValues = {
  name: '',
  town: '',
  area: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  cuisine: '',
  diningType: '',
  priceLevel: '',
  averageMealCost: undefined,
  seatsPerSlot: 20,
  description: '',
  images: '',
  hours: {
    monday: { ...emptyDay },
    tuesday: { ...emptyDay },
    wednesday: { ...emptyDay },
    thursday: { ...emptyDay },
    friday: { ...emptyDay },
    saturday: { ...emptyDay },
    sunday: { ...emptyDay },
  },
} as unknown as RestaurantFormValues

/** Saved restaurant -> form values (edit mode) */
export function toFormValues(r: RestaurantRecord): RestaurantFormValues {
  const [lng, lat] = r.location?.coordinates ?? []
  const hours = {} as Record<string, { closed: boolean; open: string; close: string }>
  for (const day of DAYS) {
    const h = r.openingHours?.[day]
    hours[day] = {
      closed: Boolean(h?.closed),
      open: h?.open || emptyDay.open,
      close: h?.close || emptyDay.close,
    }
  }
  return {
    name: r.name,
    town: r.town,
    area: r.area ?? '',
    address: r.address,
    latitude: lat,
    longitude: lng,
    cuisine: r.cuisine,
    diningType: r.diningType,
    priceLevel: r.priceLevel,
    averageMealCost: r.averageMealCost,
    seatsPerSlot: r.seatsPerSlot ?? 20,
    description: r.description ?? '',
    images: (r.images ?? []).join('\n'),
    hours,
  } as unknown as RestaurantFormValues
}

/** Form values -> body sent to the server. Location is GeoJSON [longitude, latitude]. */
export function toPayload(v: RestaurantFormValues): RestaurantPayload {
  const openingHours: Record<string, { open: string; close: string; closed: boolean }> = {}
  for (const day of DAYS) openingHours[day] = { ...v.hours[day] }

  return {
    name: v.name,
    town: v.town,
    area: v.area || undefined,
    address: v.address,
    location: { type: 'Point', coordinates: [v.longitude, v.latitude] },
    cuisine: v.cuisine,
    diningType: v.diningType,
    priceLevel: v.priceLevel,
    averageMealCost: v.averageMealCost,
    seatsPerSlot: v.seatsPerSlot,
    description: v.description || undefined,
    images: (v.images ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    openingHours,
  }
}