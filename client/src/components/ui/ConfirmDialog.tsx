import Button from './Button'

type Props = {
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Every delete asks first
export default function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown/50 p-4" role="alertdialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-brown">{title}</h2>
        <p className="mt-2 text-sm text-brown/70">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
