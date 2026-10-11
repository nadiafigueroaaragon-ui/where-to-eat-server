const BLOCKS = ['a', 'b', 'c']

// Pulsing placeholders while data loads. Use lines for lists and a single block for a page.
export default function LoadingState({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading" className={`flex flex-col gap-4 ${className}`}>
      {BLOCKS.slice(0, rows).map((id) => (
        <div key={id} className="h-28 animate-pulse rounded-2xl bg-brown/5" />
      ))}
    </div>
  )
}
