// Opening hours helpers. Hours are stored per day: { open: 'HH:mm', close: 'HH:mm', closed: boolean }.
// A close time earlier than the open time means the restaurant closes after midnight
// (for example ChonNom, open until 2 AM). "Open now" is computed in Philippine time while rendering.
export type DayHours = { open?: string; close?: string; closed?: boolean }
export type OpeningHours = Record<string, DayHours> | Array<DayHours & { day: string }>

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

// Accept either { monday: {...} } or [{ day: 'monday', ... }]
export function normalizeHours(hours?: OpeningHours | null): Record<string, DayHours> {
  const out: Record<string, DayHours> = {}
  if (!hours) return out
  if (Array.isArray(hours)) hours.forEach((h) => (out[h.day.toLowerCase()] = h))
  else Object.entries(hours).forEach(([day, h]) => (out[day.toLowerCase()] = h))
  return out
}

const toMinutes = (t?: string) => {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m
}

function manilaNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: get('weekday').toLowerCase(), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function isOpenNow(hours?: OpeningHours | null, date = new Date()): boolean | null {
  const table = normalizeHours(hours)
  if (Object.keys(table).length === 0) return null // no hours on file

  const { day, minutes } = manilaNow(date)
  const yesterday = DAYS[(DAYS.indexOf(day as (typeof DAYS)[number]) + 6) % 7]

  // Still open from yesterday's late-night shift?
  const prev = table[yesterday]
  const prevOpen = toMinutes(prev?.open)
  const prevClose = toMinutes(prev?.close)
  if (prev && !prev.closed && prevOpen !== null && prevClose !== null && prevClose < prevOpen && minutes < prevClose) {
    return true
  }

  const today = table[day]
  const open = toMinutes(today?.open)
  const close = toMinutes(today?.close)
  if (!today || today.closed || open === null || close === null) return false
  return close > open ? minutes >= open && minutes < close : minutes >= open // past midnight: rest handled tomorrow
}

// '14:30' -> '2:30 PM'
export function formatTime(t?: string) {
  const m = toMinutes(t)
  if (m === null) return ''
  const h = Math.floor(m / 60)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${suffix}`
}
