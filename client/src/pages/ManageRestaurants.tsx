import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusBadge from '../components/StatusBadge'
import { EmptyView, ErrorView, LoadingView, NoticeBanner } from '../components/StateViews'
import { useFetch } from '../hooks/useFetch'
import {
  deleteRestaurant,
  getErrorMessage,
  getRestaurants,
  type RestaurantRecord,
  type RestaurantStatus,
} from '../api/restaurants'

const STATUSES: RestaurantStatus[] = ['approved', 'pending', 'rejected']

/** Admin table: view restaurants by status, edit, delete. */
export default function ManageRestaurants() {
  const [status, setStatus] = useState<RestaurantStatus>('approved')
  const { data, loading, error, reload } = useFetch(() => getRestaurants(status), [status])

  const [notice, setNotice] = useState('')
  const [toDelete, setToDelete] = useState<RestaurantRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-brown">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-script text-4xl">Manage restaurants</h1>
        <div role="group" aria-label="Filter by status" className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={`rounded-full px-4 py-1 text-xs capitalize ${
                status === s ? 'bg-brown text-cream' : 'border border-brown/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <NoticeBanner message={notice} onClose={() => setNotice('')} />

      {loading && <LoadingView label="Loading restaurants…" />}
      {error && <ErrorView message={error} onRetry={reload} />}

      {!loading && !error && data && data.length === 0 && (
        <EmptyView title={`No ${status} restaurants`} hint="Try another status." />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-brown/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-brown/5 text-xs">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Town</th>
                <th className="px-4 py-3 font-semibold">Cuisine</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown/10">
              {data.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3">
                    <Link to={`/restaurants/${r._id}`} className="hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.town}</td>
                  <td className="px-4 py-3">{r.cuisine ?? '-'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
