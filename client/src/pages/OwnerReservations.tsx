import { useEffect, useState } from 'react'
import { CalendarDays, Phone, Users } from 'lucide-react'
import api from '../api/axios'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'

type Reservation = {
  _id: string
  date: string
  time: string
  startsAt: string
  guests: number
  contactName: string
  contactPhone?: string
  status: string
  restaurant?: { _id: string; name: string; town?: string; area?: string } | null
}

const ACTIVE = ['pending', 'confirmed']

const messageOf = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  'Could not load reservations. Please try again.'

// "2026-12-10" -> "Thu, Dec 10, 2026"
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const statusClass = (status: string) =>
  status === 'confirmed'
    ? 'bg-olive/15 text-olive'
    : status === 'cancelled'
      ? 'bg-brick/10 text-brick'
      : 'bg-sun/40 text-brown'

function Row({ r }: { r: Reservation }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brown/5 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brown">{r.contactName}</p>
        <p className="text-xs text-brown/60">{r.restaurant?.name ?? 'Restaurant removed'}</p>
        {r.contactPhone && (
          <a
            href={`tel:${r.contactPhone}`}
            className="mt-1 inline-flex items-center gap-1 text-xs text-olive underline"
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            {r.contactPhone}
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-brown">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatDate(r.date)} · {r.time}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" aria-hidden="true" />
          {r.guests} {r.guests === 1 ? 'guest' : 'guests'}
        </span>
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusClass(r.status)}`}>
          {r.status}
        </span>
      </div>
    </li>
  )
}

export default function OwnerReservations() {
  const [list, setList] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .get<Reservation[]>('/reservations/owner')
      .then((res) => {
        if (!cancelled) setList(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(messageOf(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  function retry() {
    setLoading(true)
    setError('')
    setAttempt((a) => a + 1)
  }

  // Derived while rendering, not stored in state
  const now = new Date()
  const isUpcoming = (r: Reservation) => ACTIVE.includes(r.status) && new Date(r.startsAt) > now
  const upcoming = list
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  const past = list.filter((r) => !isUpcoming(r))

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-8">
      <h1 className="font-script text-4xl text-brown sm:text-5xl">Reservations</h1>
      <p className="mt-1 text-sm text-brown/70">Bookings made at your restaurants.</p>

      {loading && <LoadingState rows={3} className="mt-6" />}
      {!loading && error && (
        <div className="mt-6">
          <ErrorState message={error} onRetry={retry} />
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="mt-6">
          <EmptyState message="No one has booked a table at your restaurants yet." />
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <>
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">
              Upcoming <span className="ml-1 font-normal text-brown/60">({upcoming.length})</span>
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-brown/5 p-4 text-sm text-brown/70">No upcoming bookings.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {upcoming.map((r) => (
                  <Row key={r._id} r={r} />
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">
                Past and cancelled <span className="ml-1 font-normal text-brown/60">({past.length})</span>
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {past.map((r) => (
                  <Row key={r._id} r={r} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  )
}