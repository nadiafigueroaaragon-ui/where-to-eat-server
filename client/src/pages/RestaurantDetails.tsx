import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

/* TODO: replace this local type with the shared Restaurant type from lib/types
   once you've pasted it. Field names follow your Restaurant model. */
type DayHours = { open?: string; close?: string; closed?: boolean };
type Restaurant = {
  _id: string;
  name: string;
  town: string;
  address: string;
  description?: string;
  cuisine?: string;
  diningType?: string;
  priceLevel?: string;
  averageMealCost?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  location?: { type: "Point"; coordinates: [number, number] };
  openingHours?: Record<string, DayHours>;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "12:00" -> "12:00 PM", "22:00" -> "10:00 PM"
function to12h(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

// Derived while rendering, not stored in state
function todayKey() {
  return DAYS[(new Date().getDay() + 6) % 7]; // JS: Sunday = 0
}

export default function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setActiveImage(0);

    api
      .get(`/restaurants/${id}`)
      .then((res) => {
        if (!cancelled) setRestaurant(res.data?.restaurant ?? res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404 || status === 400) setNotFound(true);
        else setError("Could not load this restaurant. Is the server running?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const shell = "mx-auto w-full max-w-4xl px-4 py-6";

  if (loading) {
    return (
      <div className={shell}>
        <div className="h-72 animate-pulse rounded-2xl bg-brown/10 sm:h-96" />
        <div className="mt-4 h-8 w-48 animate-pulse rounded bg-brown/10" />
      </div>
    );
  }

  if (notFound || (!error && !restaurant)) {
    return (
      <div className={`${shell} text-center text-brown`}>
        <p className="font-script text-3xl">Restaurant not found</p>
        <p className="mt-2 text-sm">It may have been removed or is not approved yet.</p>
        <Link to="/towns" className="mt-4 inline-block text-sm underline">
          Browse towns
        </Link>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={`${shell} text-center text-brick`}>
        <p>{error}</p>
      </div>
    );
  }

  const images = restaurant.images ?? [];
  const hours = restaurant.openingHours ?? {};
  const today = todayKey();
  const [lng, lat] = restaurant.location?.coordinates ?? [];
  const mapsUrl =
    lat !== undefined && lng !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${restaurant.name} ${restaurant.address}`
        )}`;
  const hasRating = (restaurant.reviewCount ?? 0) > 0 && restaurant.rating;

  return (
    <div className={`${shell} text-brown`}>
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-xs hover:underline">
        <span aria-hidden>←</span> All restaurants
      </Link>

      {/* Gallery */}
      {images.length > 0 ? (
        <>
          <img
            src={images[activeImage]}
            alt={`${restaurant.name} photo ${activeImage + 1}`}
            className="h-72 w-full rounded-2xl object-cover sm:h-96"
          />
          {images.length > 1 && (
            <div className="mt-2 grid grid-cols-6 gap-2">
              {images.slice(0, 6).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-brown" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="h-14 w-full object-cover sm:h-16" />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-2xl bg-brown/10 text-sm sm:h-96">
          No photos yet
        </div>
      )}

      {/* Title + rating */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="font-script text-4xl leading-tight">{restaurant.name}</h1>
        <span className="mt-2 flex items-center gap-1 text-xs">
          <span className="text-sun" aria-hidden>
            ☆
          </span>
          {hasRating ? restaurant.rating!.toFixed(1) : "New"}
          {hasRating && (
            <span className="opacity-60">({restaurant.reviewCount})</span>
          )}
        </span>
      </div>

      {/* Tags + book button */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[11px]">
          {restaurant.cuisine && (
            <span className="rounded-full bg-sun px-3 py-1">{restaurant.cuisine}</span>
          )}
          {restaurant.diningType && (
            <span className="rounded-full bg-brown/10 px-3 py-1">
              {label(restaurant.diningType)}
            </span>
          )}
          {restaurant.priceLevel && (
            <span className="rounded-full bg-brown/10 px-3 py-1">
              {label(restaurant.priceLevel)}
            </span>
          )}
        </div>
        {/* No booking route exists yet. Wire this up when the reservation page is built. */}
        <button
          type="button"
          className="rounded-full bg-brown px-4 py-2 text-xs text-cream"
        >
          Book a reservation
        </button>
      </div>

      {restaurant.description && (
        <p className="mt-4 max-w-prose text-sm leading-relaxed">{restaurant.description}</p>
      )}

      {/* Meal cost + location */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl bg-brown/5 p-4">
          <h2 className="text-[11px] opacity-60">Average meal</h2>
          <p className="mt-1 text-sm font-semibold">
            {restaurant.averageMealCost != null
              ? `₱${restaurant.averageMealCost.toLocaleString()}`
              : "Not listed"}
          </p>
        </section>
        <section className="rounded-xl bg-brown/5 p-4">
          <h2 className="text-[11px] opacity-60">Location</h2>
          <p className="mt-1 text-xs leading-relaxed">{restaurant.address}</p>
          <p className="text-[11px] opacity-60">{restaurant.town}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-[11px] underline"
          >
            Open in Google Maps
          </a>
        </section>
      </div>

      {/* Opening hours */}
      <h2 className="mt-6 mb-2 text-xs font-semibold">Opening hours</h2>
      <ul className="divide-y divide-brown/10 overflow-hidden rounded-xl border border-brown/10 text-xs">
        {DAYS.map((day) => {
          const h = hours[day];
          const isToday = day === today;
          return (
            <li
              key={day}
              className={`flex justify-between px-4 py-2 ${isToday ? "font-bold" : ""}`}
            >
              <span>{label(day)}</span>
              <span>
                {!h || h.closed ? "Closed" : `${to12h(h.open)} - ${to12h(h.close)}`}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Reviews */}
      <h2 className="mt-6 mb-2 text-xs font-semibold">Reviews</h2>
      <div className="rounded-xl bg-brown/5 p-6 text-center text-xs">
        Reviews will appear here once they are available.
      </div>
    </div>
  );
}
