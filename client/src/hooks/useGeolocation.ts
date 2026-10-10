import { useCallback, useState } from 'react'

export type Coords = { lat: number; lng: number }
export type GeoStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'unsupported'

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<GeoStatus>('idle')

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ready')
      },
      () => setStatus('denied'),
      { timeout: 10000 },
    )
  }, [])

  return { coords, status, request }
}