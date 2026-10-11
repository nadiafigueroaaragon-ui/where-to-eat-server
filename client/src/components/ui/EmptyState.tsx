import type { ReactNode } from 'react'

type Props = { message: string; children?: ReactNode }

export default function EmptyState({ message, children }: Props) {
  return (
    <div className="rounded-2xl bg-brown/5 p-8 text-center">
      <p className="text-sm text-brown">{message}</p>
      {children && <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}
