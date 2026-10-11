import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusBadge from '../components/StatusBadge'
import { EmptyView, ErrorView, LoadingView, NoticeBanner } from '../components/StateViews'
import { useFetch } from '../hooks/useFetch'
import {
  deleteRestaurant,
  getErrorMessage,
  getMyRestaurants,
  type RestaurantRecord,
} from '../api/restaurants'

export default function OwnerDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useFetch(getMyRestaurants, [])

  const [notice, setNotice] = useState<string>((location.state as { notice?: string } | null)?.notice ?? '')
  const [toDelete, setToDelete] = useState<RestaurantRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Clear the router state so the message doesn't come back on refresh
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteRestaurant(toDelete._id)
      setNotice(`${toDelete.name} was deleted.`)
      setToDelete(null)
      reload()
    } catch (err) {
      setNotice(getErrorMessage(err, 'Could not delete the restaurant.'))
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-brown">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-script text-4xl">My restaurants</h1>
        <Link to="/restaurants/new" className="rounded-full bg-sun px-4 py-2 text-xs font-semibold">
          Add a restaurant
        </Link>
      </div>

      <NoticeBanner message={notice} onClose={() => setNotice('')} />

      {loading && <LoadingView label="Loading your restaurants…" />}
      {error && <ErrorView message={error} onRetry={reload} />}

      {!loading && !error && data && data.length === 0 && (
        <EmptyView
          title="No restaurants yet"
          hint="Apply your first restaurant. An admin will review it."
          action={
            <Link to="/restaurants/new" className="rounded-full bg-brown px-4 py-2 text-xs text-cream">
              Apply a restaurant
            </Link>
          }
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((r) => (
            <li
              key={r._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brown/5 p-4"
            >
              <div>
                <Link to={`/restaurants/${r._id}`} className="font-semibold hover:underline">
                  {r.name}
                </Link>
                <p className="text-xs text-brown/70">
                  {r.town}
                  {r.cuisine ? ` · ${r.cuisine}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <Link
                  to={`/restaurants/${r._id}/edit`}
                  className="rounded-full border border-brown/30 px-3 py-1 text-xs"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setToDelete(r)}
                  className="rounded-full border border-brick px-3 py-1 text-xs text-brick"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete restaurant?"
        message={`This permanently deletes ${toDelete?.name ?? 'this restaurant'}.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </main>
  )
}
