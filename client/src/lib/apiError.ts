import axios from 'axios'

// Turns any request error into one readable message for the user
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message
    if (msg) return msg
    if (!err.response) return 'Cannot reach the server. Is it running?'
  }
  return 'Something went wrong. Please try again.'
}
