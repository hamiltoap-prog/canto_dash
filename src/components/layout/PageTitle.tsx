import type { ReactNode } from 'react'

export function PageTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-1 flex flex-col gap-0.5">
      <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text)]">{children}</h1>
      {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
    </div>
  )
}
