import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel = 'Excluir', danger = true, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-raised)]"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-chip)] bg-[var(--color-naipe-soprano-soft)] text-[var(--color-naipe-soprano)]">
              <AlertTriangle size={17} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
