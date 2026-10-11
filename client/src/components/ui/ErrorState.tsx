import type { ReactNode } from 'react'
import Button from './Button'

type Props = { message: string; onRetry?: () => void; children?: ReactNode }

export default function ErrorState({ message, onRetry, children }: Props) {
  return (
    <div role="alert" className="rounded-2xl border border-brick/30 bg-brick/5 p-6 text-center">
      <p className="text-sm text-brick">{message}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        {children}
      </div>
    </div>
  )
}
