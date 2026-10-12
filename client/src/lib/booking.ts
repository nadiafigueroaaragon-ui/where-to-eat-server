import { isAxiosError } from 'axios'

export type Slot = { time: string; seatsLeft: number; available: boolean }

export type Availability = {
  restaurant: string
  date: string
  guests: number
  seatsPerSlot: number
  closed: boolean
  slots: Slot[]
}

export type Reservation = {
  _id: string
  restaurant: { _id: string; name: string; town?: string; area?: string } | null
  date: string
  time: string
  startsAt: string
  guests: number
  contactName: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export const MAX_GUESTS = 12
export const MAX_ADVANCE_DAYS = 60

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function to12h(time: string) {
  const [h, m] = time.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export function longDate(date: string) {
  return new Date(`${date}T12:00:00+08:00`).toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila',
  })
}

export function errorMessage(err: unknown) {
  if (isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Please check your connection and try again.'
    return (err.response.data as { message?: string } | undefined)?.message ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export const errorStatus = (err: unknown) => (isAxiosError(err) ? err.response?.status : undefined)
