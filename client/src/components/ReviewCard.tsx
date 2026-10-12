import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import StarRating from './ui/StarRating'
import StatusBadge from './ui/StatusBadge'
import { formatDate } from '../lib/dates'
import type { Review } from '../lib/review'

type Props = {
  review: Review
  showRestaurant?: boolean // show the restaurant name (My reviews, moderation)
  showAuthor?: boolean // show who wrote it
  showStatus?: boolean
  children?: ReactNode // action buttons
}

export default function ReviewCard({ review: r, showRestaurant, showAuthor = true, showStatus, children }: Props) {
  return (
    <article className="rounded-2xl border border-brown/10 bg-cream p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {showRestaurant && r.restaurant && (
            <Link to={`/restaurants/${r.restaurant._id}`} className="font-semibold text-brown underline-offset-4 hover:underline">
              {r.restaurant.name}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <StarRating value={r.rating} />
            {showAuthor && r.user && <span className="text-sm text-brown">{r.user.name}</span>}
          </div>
        </div>
        {showStatus && <StatusBadge status={r.status} />}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm text-brown">{r.comment}</p>
      <p className="mt-2 text-xs text-brown/60">Visited {formatDate(r.visitDate)}</p>

      {showStatus && r.status === 'pending' && (
        <p className="mt-2 text-xs text-brown/70">Waiting for an admin to approve it. It will not count toward the rating until then.</p>
      )}
      {showStatus && r.status === 'rejected' && (
        <p className="mt-2 text-xs text-brick">This review was not approved. You can edit it and send it again.</p>
      )}

      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </article>
  )
}
