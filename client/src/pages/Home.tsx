import { useState } from 'react'
import Hero from '../components/Hero'
import FilterChips from '../components/FilterChips'
import RestaurantCard from '../components/RestaurantCard'
import { useGeolocation } from '../hooks/useGeolocation'
import { useRestaurants } from '../hooks/useRestaurants'
import { emptyFilters, type Filters } from '../lib/filters'

const SKELETONS = ['a', 'b', 'c', 'd']

export default function Home() {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const geo = useGeolocation()

  // Derived while rendering, not stored in state
  const waiting = Boolean(filters.walkMinutes) && geo.status === 'loading'
  const locationFailed = Boolean(filters.walkMinutes) && (geo.status === 'denied' || geo.status === 'unsupported')
  const hasFilters = Object.values(filters).some(Boolean)

  const { restaurants, loading, error, retry } = useRestaurants(filters, geo.coords, waiting)

  // Ask the browser for the location the first time a distance is picked
  function handleFilters(next: Filters) {
    if (next.walkMinutes && geo.status === 'idle') geo.request()
    setFilters(next)
  }

  return (
    <main className="pb-16">
      <Hero />
      <FilterChips filters={filters} onChange={handleFilters} />

      {locationFailed && (
        <p role="status" className="mx-auto mt-4 max-w-xl rounded-2xl bg-sun/40 px-4 py-3 text-center text-xs text-brown">
          We could not get your location, so the distance filter is not applied. Allow location access in your
          browser, then
          <button type="button" onClick={geo.request} className="ml-1 underline">
            try again
          </button>
          .
        </p>
      )}

      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brown">
          {hasFilters ? 'Results' : 'Top rated restaurants'}
          {!loading && !error && <span className="ml-2 font-normal text-brown/60">({restaurants.length})</span>}
        </h2>

        {loading && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SKELETONS.map((id) => (
              <div key={id} className="h-64 animate-pulse rounded-2xl bg-brown/5" />
            ))}
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-2xl border border-brick/30 bg-brick/5 p-6 text-center">
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

        {!loading && !error && restaurants.length === 0 && (
          <div className="mt-4 rounded-2xl bg-brown/5 p-8 text-center">
            <p className="text-sm text-brown">No restaurants match these filters yet.</p>
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="mt-3 rounded-full border border-brown/60 px-5 py-1.5 text-xs text-brown transition-colors hover:border-olive hover:bg-olive hover:text-cream"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}