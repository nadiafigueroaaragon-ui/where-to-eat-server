import axios from 'axios'

// Turns an axios error into a message a person can read. Servers always reply { message }.
export function messageFrom(err: unknown, fallback: string) {
  const e = err as { response?: { status?: number; data?: { message?: string } } }
  if (e.response?.status === 401) return 'Please log in first.'
  return e.response?.data?.message || fallback
}

// Turns any request error into one readable message for the user
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
    if (!err.response) return 'Cannot reach the server. Is it running?'
  }
  return 'Something went wrong. Please try again.'
}