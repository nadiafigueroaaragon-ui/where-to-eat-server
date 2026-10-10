import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useTowns } from '../hooks/useTowns'

const SKELETONS = ['a', 'b', 'c', 'd']

export default function Towns() {
  const { towns, loading, error, retry } = useTowns()

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-8 sm:pt-16">
      <h1 className="font-script text-5xl leading-tight text-brown sm:text-6xl">Browse by city</h1>
      <p className="mt-3 text-sm text-brown/70">Pick a city to see its approved restaurants.</p>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SKELETONS.map((id) => (
            <div key={id} className="h-28 animate-pulse rounded-2xl bg-brown/5" />
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-8 rounded-2xl border border-brick/30 bg-brick/5 p-6 text-center">
          <p className="text-sm text-brick">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 rounded-full bg-brown px-5 py-1.5 text-xs text-cream transition-colors hover:bg-olive"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && towns.length === 0 && (
        <div className="mt-8 rounded-2xl bg-brown/5 p-8 text-center">
          <p className="text-sm text-brown">No cities have been added yet.</p>
        </div>
      )}

      {!loading && !error && towns.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {towns.map((t) => (
            <Link
              key={t._id}
              to={`/towns/${t._id}`}
              className="flex flex-col gap-2 rounded-2xl border border-brown/10 bg-cream p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex items-center gap-2 text-lg font-semibold text-brown">
                <MapPin className="h-5 w-5 shrink-0 text-olive" aria-hidden="true" />
                {t.name}
              </span>
              {t.description && <span className="line-clamp-3 text-sm text-brown/70">{t.description}</span>}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}