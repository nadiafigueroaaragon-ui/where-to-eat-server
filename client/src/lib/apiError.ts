// Turns an axios error into a message a person can read. Servers always reply { message }.
export function messageFrom(err: unknown, fallback: string) {
  const e = err as { response?: { status?: number; data?: { message?: string } } }
  if (e.response?.status === 401) return 'Please log in first.'
  return e.response?.data?.message || fallback
}
