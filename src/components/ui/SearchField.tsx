import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

export function SearchField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
      <input
        type="search"
        className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)]
          py-2.5 pl-9 pr-3.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]"
        {...props}
      />
    </div>
  )
}
