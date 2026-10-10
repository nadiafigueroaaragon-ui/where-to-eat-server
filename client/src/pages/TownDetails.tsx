import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'
import { useTown } from '../hooks/useTown'

export default function TownDetails() {
  const { id } = useParams()
  const { data, loading, error, notFound, retry } = useTown(id)
  const [cuisine, setCuisine] = useState('')

  // Derived while rendering, not stored in state
  const restaurants = data?.restaurants ?? []
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))].sort()
  const shown = cuisine ? restaurants.filter((r) => r.cuisine === cuisine) : restaurants
  const rated = restaurants.filter((r) => r.reviewCount > 0)
  const averageRating = rated.length > 0 ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length : null
  const averageCost =
    restaurants.length > 0
      ? Math.round(restaurants.reduce((sum, r) => sum + r.averageMealCost, 0) / restaurants.length)
      : null

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-8 sm:pt-14">
      <Link to="/towns" className="inline-flex items-center gap-1 text-sm text-brown/70 hover:text-brown">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All cities
      </Link>

      {loading && (
        <div className="mt-6 space-y-4">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-brown/5" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {['a', 'b', 'c', 'd'].map((key) => (
              <div key={key} className="h-64 animate-pulse rounded-2xl bg-brown/5" />
            ))}
          </div>
        </div>
      )}

      {!loading && notFound && (
        <div className="mt-6 rounded-2xl bg-brown/5 p-8 text-center">
          <p className="text-sm text-brown">We could not find that city.</p>
          <Link
            to="/towns"
            className="mt-3 inline-block rounded-full border border-brown/60 px-5 py-1.5 text-xs text-brown transition-colors hover:border-olive hover:bg-olive hover:text-cream"
          >
            Back to all cities
          </Link>
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="mt-6 rounded-2xl border border-brick/30 bg-brick/5 p-6 text-center">
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

      {!loading && !error && !notFound && data && (
        <>
          <h1 className="mt-6 font-script text-5xl leading-tight text-brown sm:text-6xl">{data.town.name}</h1>
          {data.town.description && <p className="mt-3 max-w-2xl text-sm text-brown/70">{data.town.description}</p>}

          <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
            <div className="rounded-2xl bg-brown/5 p-4 text-center">
              <dt className="text-xs uppercase tracking-wide text-brown/60">Restaurants</dt>
              <dd className="mt-1 text-lg font-semibold text-brown">{data.count}</dd>
            </div>
            <div className="rounded-2xl bg-brown/5 p-4 text-center">
              <dt className="text-xs uppercase tracking-wide text-brown/60">Avg rating</dt>
              <dd className="mt-1 text-lg font-semibold text-brown">
                {averageRating !== null ? averageRating.toFixed(1) : '-'}
              </dd>
            </div>
            <div className="rounded-2xl bg-brown/5 p-4 text-center">
              <dt className="text-xs uppercase tracking-wide text-brown/60">Avg meal</dt>
              <dd className="mt-1 text-lg font-semibold text-brown">
                {averageCost !== null ? `₱${averageCost.toLocaleString()}` : '-'}
              </dd>
            </div>
          </dl>

          {cuisines.length > 1 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <label htmlFor="cuisine" className="text-xs font-semibold uppercase tracking-wide text-brown">
                Cuisine
              </label>
              <select
                id="cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="rounded-full border border-brown/60 bg-cream px-4 py-1.5 text-sm text-brown focus:outline-none"
              >
                <option value="">All cuisines</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {cuisine && (
                <button type="button" onClick={() => setCuisine('')} className="text-xs text-brick underline">
                  Clear
                </button>
              )}
            </div>
          )}

          {shown.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-brown/5 p-8 text-center">
              <p className="text-sm text-brown">No restaurants to show in {data.town.name} yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((r) => (
                <RestaurantCard key={r._id} restaurant={r} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}