const TZ = 'Asia/Manila'

// Today as YYYY-MM-DD in Philippine time (the project's agreed time zone)
export function todayManila() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', timeZone: TZ })
}

// YYYY-MM-DD for <input type="date"> from an ISO string
export function toDateInput(iso: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}
