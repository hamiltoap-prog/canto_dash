import type { ReactNode } from 'react'
import { Music } from 'lucide-react'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div
      className="stage-scope relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'var(--color-stage-surface)', backgroundImage: 'var(--stage-glow)' }}
    >
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-12 items-center justify-center rounded-xl text-[var(--color-accent-contrast)]"
            style={{ background: 'var(--color-accent)', boxShadow: '0 0 32px -6px rgba(156, 127, 76, 0.6)' }}
          >
            <Music size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 backdrop-blur-xl"
          style={{ boxShadow: '0 24px 60px -20px rgba(0, 0, 0, 0.6)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
