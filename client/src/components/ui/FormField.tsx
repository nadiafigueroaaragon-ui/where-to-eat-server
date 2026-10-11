import type { ReactNode } from 'react'

type Props = { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }

// Label on top, the input, then the error right under it
export default function FormField({ label, htmlFor, error, hint, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase text-brown">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-brown/60">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-brick">
          {error}
        </p>
      )}
    </div>
  )
}
