import { useState } from 'react'
import { CheckCircle2, AlertCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import TownForm from '../components/TownForm'
import { useTownAdmin } from '../hooks/useTownAdmin'
import type { Town } from '../lib/town'
import type { TownFormValues } from '../lib/townSchema'

type Notice = { kind: 'success' | 'error'; text: string }

export default function ManageTowns() {
  const { towns, loading, error, reload, createTown, updateTown, deleteTown } = useTownAdmin()
  const [editing, setEditing] = useState<Town | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Town | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSave(values: TownFormValues) {
    try {
      if (editing === 'new') {
        await createTown(values)
        setNotice({ kind: 'success', text: `${values.name} was added.` })
      } else if (editing) {
        await updateTown(editing._id, values)
        setNotice({ kind: 'success', text: `${values.name} was updated.` })
      }
      setEditing(null)
    } catch (err) {
      setNotice({ kind: 'error', text: (err as Error).message })
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteTown(deleting._id)
      setNotice({ kind: 'success', text: `${deleting.name} was deleted.` })
    } catch (err) {
      setNotice({ kind: 'error', text: (err as Error).message })
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-script text-4xl text-brown sm:text-5xl">Manage towns</h1>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-full bg-brown px-5 py-2 text-xs text-cream transition-colors hover:bg-olive"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add town
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`mt-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
            notice.kind === 'success' ? 'bg-olive/10 text-olive' : 'bg-brick/10 text-brick'
          }`}
        >
          {notice.kind === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {loading && <div className="mt-6 h-40 animate-pulse rounded-2xl bg-brown/5" />}

      {error && (
        <div role="alert" className="mt-6 rounded-2xl border border-brick/30 bg-brick/5 p-6 text-center">
          <p className="text-sm text-brick">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-full bg-brown px-5 py-1.5 text-xs text-cream transition-colors hover:bg-olive"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && towns.length === 0 && (
        <div className="mt-6 rounded-2xl bg-brown/5 p-8 text-center text-sm text-brown">
          No towns yet. Click &quot;Add town&quot; to create the first one.
        </div>
      )}

      {!loading && !error && towns.length > 0 && (
        <ul className="mt-6 divide-y divide-brown/10 rounded-2xl border border-brown/10 bg-cream">
          {towns.map((t) => (
            <li key={t._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
                <p className="font-semibold text-brown">{t.name}</p>
                {t.description && <p className="truncate text-sm text-brown/70">{t.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(t)}
                  aria-label={`Edit ${t.name}`}
                  className="inline-flex items-center gap-1 rounded-full border border-brown/60 px-4 py-1.5 text-xs text-brown transition-colors hover:border-olive hover:bg-olive hover:text-cream"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(t)}
                  aria-label={`Delete ${t.name}`}
                  className="inline-flex items-center gap-1 rounded-full border border-brick/60 px-4 py-1.5 text-xs text-brick transition-colors hover:bg-brick hover:text-cream"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add and edit dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-brown">{editing === 'new' ? 'Add a town' : 'Edit town'}</h2>
            <TownForm
              initialValues={
                editing === 'new' ? undefined : { name: editing.name, description: editing.description ?? '' }
              }
              submitLabel={editing === 'new' ? 'Add town' : 'Save changes'}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown/50 p-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-cream p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-brown">Delete {deleting.name}?</h2>
            <p className="mt-2 text-sm text-brown/70">This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded-full border border-brown/60 px-5 py-2 text-xs text-brown transition-colors hover:border-olive hover:bg-olive hover:text-cream"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="rounded-full bg-brick px-5 py-2 text-xs text-cream transition-opacity disabled:opacity-50"
              >
                {busy ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}