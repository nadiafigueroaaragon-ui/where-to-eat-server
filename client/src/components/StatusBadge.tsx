import type { RestaurantStatus } from '../api/restaurants'

const styles: Record<RestaurantStatus, string> = {
  pending: 'bg-sun text-brown',
  approved: 'bg-olive text-cream',
  rejected: 'bg-brick text-cream',
}

export default function StatusBadge({ status }: { status: RestaurantStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[11px] capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
