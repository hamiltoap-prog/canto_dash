import type { ReactNode } from 'react'
import { Loader2, AlertCircle, Inbox } from 'lucide-react'

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-[var(--color-text-muted)]">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <AlertCircle className="text-red-500" size={24} />
      <p className="text-sm text-[var(--color-text)]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-[var(--color-accent)] hover:underline">
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-[var(--color-text-muted)]">
      <Inbox size={24} />
      <p className="text-sm">{message}</p>
      {action}
    </div>
  )
}
