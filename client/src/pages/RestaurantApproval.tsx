import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyView, ErrorView, LoadingView, NoticeBanner } from '../components/StateViews'
import { useFetch } from '../hooks/useFetch'
import {
  getErrorMessage,
  getRestaurants,
  setRestaurantStatus,
  type RestaurantRecord,
} from '../api/restaurants'

/** Admin: approve or reject restaurants waiting for review. */
export default function RestaurantApproval() {
  const { data, loading, error, reload } = useFetch(() => getRestaurants('pending'), [])
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function decide(r: RestaurantRecord, status: 'approved' | 'rejected') {
    setBusyId(r._id)
    try {
      await setRestaurantStatus(r._id, status)
      setNotice(`${r.name} was ${status}.`)
      reload()
    } catch (err) {
      setNotice(getErrorMessage(err, 'Could not update the status.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-brown">
      <h1 className="mb-6 font-script text-4xl">Restaurant approvals</h1>

      <NoticeBanner message={notice} onClose={() => setNotice('')} />

      {loading && <LoadingView label="Loading pending restaurants…" />}
      {error && <ErrorView message={error} onRetry={reload} />}

      {!loading && !error && data && data.length === 0 && (
        <EmptyView title="Nothing to review" hint="New applications will show up here." />
      )}

      {!loading && !error && data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((r) => (
            <li key={r._id} className="rounded-xl bg-brown/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/restaurants/${r._id}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  <p className="text-xs text-brown/70">
                    {r.town}
                    {r.cuisine ? ` · ${r.cuisine}` : ''}
                    {r.priceLevel ? ` · ${r.priceLevel}` : ''}
                  </p>
                  <p className="mt-1 text-xs">{r.address}</p>
                  {r.description && <p className="mt-2 max-w-prose text-sm">{r.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === r._id}
                    onClick={() => decide(r, 'approved')}
                    className="rounded-full bg-olive px-4 py-2 text-xs text-cream disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r._id}
                    onClick={() => decide(r, 'rejected')}
                    className="rounded-full bg-brick px-4 py-2 text-xs text-cream disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
