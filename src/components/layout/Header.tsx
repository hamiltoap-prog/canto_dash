import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useAppStore } from '../../store/useAppStore'
import { NAIPE_LABELS, NAIPE_ORDER } from '../../lib/naipe'
import { signOut } from '../../api/auth'

export function Header() {
  const groups = useAppStore((s) => s.groups)
  const activeGroupId = useAppStore((s) => s.activeGroupId)
  const setActiveGroupId = useAppStore((s) => s.setActiveGroupId)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const naipe = useAppStore((s) => s.naipe)
  const setNaipe = useAppStore((s) => s.setNaipe)

  const activeGroup = groups.find((g) => g.id === activeGroupId)

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div className="relative">
          <select
            value={activeGroupId ?? ''}
            onChange={(e) => setActiveGroupId(e.target.value)}
            className="appearance-none rounded-[var(--radius-control)] border border-[var(--color-border)]
              bg-[var(--color-surface-raised)] py-2 pl-3 pr-8 text-sm font-semibold text-[var(--color-text)] outline-none"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex size-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => signOut()}
            aria-label="Sair"
            className="flex size-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <nav className="mx-auto flex max-w-4xl gap-1.5 overflow-x-auto px-4 pb-3" aria-label="Filtro por naipe">
        {NAIPE_ORDER.map((n) => {
          const active = n === naipe
          return (
            <button
              key={n}
              data-naipe={n}
              onClick={() => setNaipe(n)}
              className={clsx(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-transparent bg-[var(--naipe-accent)] text-white'
                  : 'border-[var(--color-border)] bg-[var(--naipe-accent-soft)] text-[var(--color-text)] hover:opacity-80',
              )}
            >
              {NAIPE_LABELS[n]}
            </button>
          )
        })}
      </nav>

      {activeGroup?.description && (
        <p className="mx-auto max-w-4xl px-4 pb-2 text-xs text-[var(--color-text-muted)]">{activeGroup.description}</p>
      )}
    </header>
  )
}
