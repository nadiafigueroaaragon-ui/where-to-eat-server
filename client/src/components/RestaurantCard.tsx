import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Footprints, MapPin, Star, Utensils } from 'lucide-react'
import type { Restaurant } from '../lib/types'

export default function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      to={`/restaurants/${r._id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-brown/10 bg-cream shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {r.imageUrl && !imageFailed ? (
        <img
          src={r.imageUrl}
          alt={r.name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-brown/5" aria-hidden="true">
          <Utensils className="h-8 w-8 text-brown/30" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-brown">{r.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-brown">
            <Star className="h-4 w-4 text-sun" aria-hidden="true" />
            {r.reviewCount > 0 ? r.rating.toFixed(1) : 'New'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-sun px-3 py-0.5 text-xs text-brown">{r.cuisine}</span>
          <span className="rounded-full bg-brown/10 px-3 py-0.5 text-xs capitalize text-brown">{r.diningType}</span>
        </div>

        <p className="flex items-center gap-1 text-sm text-brown/70">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{r.area || r.town}</span>
        </p>
          {r.walkMinutes !== undefined && (
          <p className="flex items-center gap-1 text-sm text-olive">
            <Footprints className="h-4 w-4 shrink-0" aria-hidden="true" />
            {r.walkMinutes} min walk
          </p>
        )}

        <p className="mt-auto text-sm text-brown">
          <span className="capitalize">{r.priceLevel}</span> · about ₱{r.averageMealCost.toLocaleString()}
        </p>
      </div>
    </Link>
  )
}