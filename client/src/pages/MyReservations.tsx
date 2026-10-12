import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import { ButtonLink } from '../components/ui/Button'
import { errorMessage, longDate, to12h, type Reservation } from '../lib/booking'

type ListResult = { tick: number; data: Reservation[] | null; error: string | null }

export default function MyReservations() {
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get<Reservation[]>('/reservations/mine')
      .then((res) => { if (!cancelled) setResult({ tick, data: res.data, error: null }) })
      .catch((err) => { if (!cancelled) setResult({ tick, data: null, error: errorMessage(err) }) })
    return () => { cancelled = true }
  }, [tick])

  async function cancel(r: Reservation) {
    if (!window.confirm(`Cancel your reservation at ${r.restaurant?.name ?? 'this restaurant'}?`)) return
    setBusy(r._id)
    setNotice('')
    try {
      await api.patch(`/reservations/${r._id}/cancel`)
      setNotice('Reservation cancelled.')
      setTick((t) => t + 1)
    } catch (err) {
      setNotice(errorMessage(err))
    } finally {
      setBusy('')
    }
  }

  const loading = result?.tick !== tick
  const list = result?.data ?? []
  const now = Date.now()

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-8">
      <h1 className="mt-8 font-script text-4xl text-brown sm:text-5xl">My reservations</h1>
      {notice && <p role="status" className="mt-4 rounded-xl bg-olive/10 px-4 py-3 text-sm text-brown">{notice}</p>}

      {loading && <div className="mt-6"><LoadingState rows={3} /></div>}
      {!loading && result?.error && <div className="mt-6"><ErrorState message={result.error} onRetry={() => setTick((t) => t + 1)} /></div>}
      {!loading && !result?.error && list.length === 0 && (
        <div className="mt-6">
          <EmptyState message="You have no reservations yet.">
            <ButtonLink to="/" variant="primary">Find a restaurant</ButtonLink>
          </EmptyState>
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {list.map((r) => {
          const upcoming = (r.status === 'confirmed' || r.status === 'pending') && new Date(r.startsAt).getTime() > now
          const status = r.status === 'cancelled' ? 'Cancelled' : upcoming ? 'Confirmed' : 'Completed'
          return (
            <li key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brown/10 bg-cream p-4 sm:p-5">
              <div>
                <h2 className="text-base font-semibold text-brown">
                  {r.restaurant ? <Link to={`/restaurants/${r.restaurant._id}`} className="hover:underline">{r.restaurant.name}</Link> : 'Restaurant removed'}
                </h2>
                <p className="text-sm text-brown/70">{longDate(r.date)} at {to12h(r.time)} &middot; {r.guests} {r.guests === 1 ? 'guest' : 'guests'}</p>
                <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                  status === 'Confirmed' ? 'bg-olive/15 text-olive' : status === 'Cancelled' ? 'bg-brick/10 text-brick' : 'bg-brown/10 text-brown'
                }`}>{status}</span>
              </div>
              {upcoming && (
                <button type="button" disabled={busy === r._id} onClick={() => cancel(r)}
                  className="rounded-full border border-brown/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-brown transition-colors hover:border-brick hover:text-brick disabled:opacity-60">
                  {busy === r._id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
