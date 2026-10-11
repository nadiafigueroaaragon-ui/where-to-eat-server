import { AlertCircle, CheckCircle2 } from 'lucide-react'

export type NoticeValue = { kind: 'success' | 'error'; text: string }

// Success and error banner shown after create, update, delete, approve and reject
export default function Notice({ notice, onDismiss }: { notice: NoticeValue; onDismiss: () => void }) {
  const ok = notice.kind === 'success'
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${ok ? 'bg-olive/10 text-olive' : 'bg-brick/10 text-brick'}`}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className="flex-1">{notice.text}</span>
      <button type="button" onClick={onDismiss} className="text-xs underline">
        Dismiss
      </button>
    </div>
  )
}
