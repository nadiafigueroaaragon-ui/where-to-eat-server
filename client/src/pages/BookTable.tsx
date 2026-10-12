import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import api from '../api/axios'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import { ButtonLink } from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { todayManila } from '../lib/dates'
import type { RestaurantDetail } from '../lib/restaurantDetail'
import {
  MAX_ADVANCE_DAYS, MAX_GUESTS, addDays, errorMessage, errorStatus, longDate, to12h,
  type Availability, type Reservation,
} from '../lib/booking'

type SlotResult = { key: string; data: Availability | null; error: string | null }

const field = 'w-full rounded-xl border border-brown/30 bg-white px-4 py-3 text-sm text-brown outline-none transition-colors focus:border-olive'
const label = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-brown/70'

export default function BookTable() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const restaurant = useApi<RestaurantDetail>(id ? `/restaurants/${id}` : null)

  const today = todayManila()
  const maxDate = addDays(today, MAX_ADVANCE_DAYS)
  const qDate = params.get('date') ?? ''
  const qGuests = Number(params.get('guests'))

  const [date, setDate] = useState(qDate >= today && qDate <= maxDate ? qDate : today)
  const [guests, setGuests] = useState(Number.isInteger(qGuests) && qGuests >= 1 && qGuests <= MAX_GUESTS ? qGuests : 2)
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [tick, setTick] = useState(0) // bump to re-check availability
  const [result, setResult] = useState<SlotResult | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<Reservation | null>(null)

  // Availability is re-fetched whenever the date, party size or tick changes
  const key = `${id}|${date}|${guests}|${tick}`
  useEffect(() => {
    if (!id || !date) return
    let cancelled = false
    api
      .get<Availability>(`/reservations/availability/${id}`, { params: { date, guests } })
      .then((res) => { if (!cancelled) setResult({ key, data: res.data, error: null }) })
      .catch((err) => { if (!cancelled) setResult({ key, data: null, error: errorMessage(err) }) })
    return () => { cancelled = true }
  }, [id, date, guests, key])

  // Derived while rendering, not stored in state
  const loadingSlots = result?.key !== key
  const slots = result?.data?.slots ?? []
  const chosen = slots.some((s) => s.time === time && s.available) ? time : ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const errs: Record<string, string> = {}
    if (!date || date < today || date > maxDate) errs.date = `Choose a date within the next ${MAX_ADVANCE_DAYS} days.`
    if (!chosen) errs.time = 'Please choose an available time.'
    if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) errs.phone = 'Enter a valid phone number (digits, +, -, spaces).'
    setErrors(errs)
    if (Object.keys(errs).length > 0 || submitting || !id) return

    setSubmitting(true)
    try {
      const res = await api.post<Reservation>('/reservations', {
        restaurantId: id, date, time: chosen, guests,
        contactName: name.trim() || undefined,
        contactPhone: phone.trim() || undefined,
      })
      setConfirmed(res.data) // shown only after the server has saved it
    } catch (err) {
      setFormError(errorMessage(err))
      if (errorStatus(err) === 409) {
        setTime('')
        setTick((t) => t + 1) // slot was just taken: refresh the times
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (restaurant.loading) return <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8"><LoadingState rows={3} /></main>
  if (restaurant.error || !restaurant.data) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <ErrorState message={restaurant.error || 'Restaurant not found'} onRetry={restaurant.retry}>
          <ButtonLink to="/" variant="secondary">Back to home</ButtonLink>
        </ErrorState>
      </main>
    )
  }
  const r = restaurant.data

  if (confirmed) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-8">
        <div role="status" className="mt-8 rounded-3xl border border-brown/15 bg-white/70 p-6 shadow-sm sm:p-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-olive text-cream" aria-hidden="true">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="font-script text-4xl text-brown">Reservation confirmed</h1>
          <dl className="mt-4 divide-y divide-brown/10 text-sm text-brown">
            <div className="flex justify-between gap-4 py-2"><dt className="text-brown/70">Restaurant</dt><dd className="font-semibold">{r.name}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-brown/70">Date</dt><dd className="font-semibold">{longDate(confirmed.date)}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-brown/70">Time</dt><dd className="font-semibold">{to12h(confirmed.time)}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-brown/70">Guests</dt><dd className="font-semibold">{confirmed.guests}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-brown/70">Name</dt><dd className="font-semibold">{confirmed.contactName}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink to="/reservations" variant="primary">View my reservations</ButtonLink>
            <ButtonLink to={`/restaurants/${r._id}`} variant="secondary">Back to {r.name}</ButtonLink>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-8">
      <Link to={`/restaurants/${r._id}`} className="mt-8 inline-block text-xs text-olive underline">&larr; Back to {r.name}</Link>
      <h1 className="mt-2 font-script text-4xl text-brown sm:text-5xl">Book a table</h1>
      <p className="mt-1 text-sm text-brown/70">{r.name} &middot; {r.address}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 rounded-3xl border border-brown/15 bg-white/70 p-6 shadow-sm sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bk-date" className={label}>Date</label>
            <input id="bk-date" type="date" min={today} max={maxDate} value={date}
              onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} className={field} />
            {errors.date && <p role="alert" className="mt-1 text-xs text-brick">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="bk-guests" className={label}>Party size</label>
            <select id="bk-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={field}>
              {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className={label}>Time</legend>
          {loadingSlots && <LoadingState rows={1} />}
          {!loadingSlots && result?.error && (
            <ErrorState message={result.error} onRetry={() => setTick((t) => t + 1)} />
          )}
          {!loadingSlots && result?.data && (
            result.data.closed ? (
              <p role="status" className="text-sm text-brown/70">This restaurant is closed on that day. Please pick another date.</p>
            ) : (
              <>
                <p className="mb-2 text-xs text-brown/60" aria-hidden="true">Solid = selected &middot; crossed out = unavailable</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Available reservation times">
                  {slots.map((s) => {
                    const selected = chosen === s.time
                    return (
                      <button key={s.time} type="button" disabled={!s.available} aria-pressed={selected}
                        onClick={() => setTime(s.time)}
                        className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-semibold transition-colors ${
                          selected ? 'border-olive bg-olive text-cream'
                            : s.available ? 'border-olive bg-white text-olive hover:bg-olive/10'
                              : 'cursor-not-allowed border-dashed border-brown/20 bg-brown/5 text-brown/40 line-through'
                        }`}>
                        {to12h(s.time)}
                        {!s.available && <span className="sr-only"> (unavailable)</span>}
                        {selected && <span className="sr-only"> (selected)</span>}
                      </button>
                    )
                  })}
                </div>
                {!slots.some((s) => s.available) && (
                  <p role="status" className="mt-3 text-sm text-brown/70">No times left for {guests} {guests === 1 ? 'guest' : 'guests'} on this date. Try another date or a smaller party.</p>
                )}
              </>
            )
          )}
          {errors.time && <p role="alert" className="mt-2 text-xs text-brick">{errors.time}</p>}
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bk-name" className={label}>Name <span className="normal-case text-brown/50">(optional)</span></label>
            <input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
              placeholder="Defaults to your account name" className={field} />
          </div>
          <div>
            <label htmlFor="bk-phone" className={label}>Contact number <span className="normal-case text-brown/50">(optional)</span></label>
            <input id="bk-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel"
              aria-invalid={!!errors.phone} className={field} />
            {errors.phone && <p role="alert" className="mt-1 text-xs text-brick">{errors.phone}</p>}
          </div>
        </div>

        {formError && <p role="alert" className="mt-4 rounded-xl bg-brick/10 px-4 py-3 text-sm text-brick">{formError}</p>}

        <button type="submit" disabled={submitting || loadingSlots}
          className="mt-6 w-full rounded-full bg-brown px-8 py-3 text-xs font-semibold uppercase tracking-wide text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Confirming...' : 'Confirm reservation'}
        </button>
      </form>
    </main>
  )
}
