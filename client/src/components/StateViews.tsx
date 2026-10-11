import type { ReactNode } from 'react'

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="py-16 text-center text-sm text-brown/70">
      {label}
    </div>
  )
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="py-16 text-center">
      <p className="text-sm text-brick">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full bg-brown px-4 py-2 text-xs text-cream"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyView({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="py-16 text-center text-brown">
      <p className="font-script text-2xl">{title}</p>
      {hint && <p className="mt-1 text-sm text-brown/70">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function NoticeBanner({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between rounded-lg bg-olive/15 px-4 py-2 text-sm text-brown"
    >
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss message" className="ml-4 text-lg leading-none">
        ×
      </button>
    </div>
  )
}
