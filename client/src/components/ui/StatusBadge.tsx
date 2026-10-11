const STYLES: Record<string, string> = {
  pending: 'bg-sun/60 text-brown',
  approved: 'bg-olive/15 text-olive',
  rejected: 'bg-brick/10 text-brick',
}

// One badge for every status: pending, approved, rejected (restaurants and reviews)
export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${STYLES[status] ?? 'bg-brown/10 text-brown'}`}>
      {status}
    </span>
  )
}
