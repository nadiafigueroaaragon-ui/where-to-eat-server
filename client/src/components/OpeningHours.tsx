import { DAYS, formatTime, normalizeHours, type OpeningHours as Hours } from '../lib/hours'

export default function OpeningHours({ hours }: { hours?: Hours }) {
  const table = normalizeHours(hours)
  if (Object.keys(table).length === 0) return <p className="text-sm text-brown/60">Opening hours are not listed yet.</p>

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      {DAYS.map((day) => {
        const h = table[day]
        const closed = !h || h.closed
        return (
          <div key={day} className="contents">
            <dt className="capitalize text-brown/70">{day}</dt>
            <dd className={closed ? 'text-brick' : 'text-brown'}>
              {closed ? 'Closed' : `${formatTime(h.open)} - ${formatTime(h.close)}`}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
