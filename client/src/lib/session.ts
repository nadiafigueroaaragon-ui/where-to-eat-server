// Tiny helper until the shared useAuth hook lands: is there a login token?
export function hasToken() {
  try {
    return Boolean(localStorage.getItem('token'))
  } catch {
    return false
  }
}
