import { useState } from 'react'
import { Moon, Sun, LogOut, ChevronDown, Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { NAIPE_LABELS, NAIPE_ORDER } from '../../lib/naipe'
import { signOut } from '../../api/auth'
import { CreateGroupModal } from '../groups/CreateGroupModal'
import { SegmentedControl } from '../ui/SegmentedControl'

const NAIPE_OPTIONS = NAIPE_ORDER.map((n) => ({ value: n, label: n === 'geral' ? 'Visão geral' : NAIPE_LABELS[n] }))

export function Header() {
  const groups = useAppStore((s) => s.groups)
  const activeGroupId = useAppStore((s) => s.activeGroupId)
  const setActiveGroupId = useAppStore((s) => s.setActiveGroupId)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const naipe = useAppStore((s) => s.naipe)
  const setNaipe = useAppStore((s) => s.setNaipe)
  const [creatingGroup, setCreatingGroup] = useState(false)

  const activeGroup = groups.find((g) => g.id === activeGroupId)

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-1.5">
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
          <button
            onClick={() => setCreatingGroup(true)}
            aria-label="Criar novo grupo"
            title="Criar novo grupo"
            className="flex size-9 items-center justify-center rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
          >
            <Plus size={16} />
          </button>
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

      <nav className="mx-auto max-w-4xl px-4 pb-3" aria-label="Filtro por naipe">
        <SegmentedControl options={NAIPE_OPTIONS} value={naipe} onChange={setNaipe} />
      </nav>

      {activeGroup?.description && (
        <p className="mx-auto max-w-4xl px-4 pb-2 text-xs text-[var(--color-text-muted)]">{activeGroup.description}</p>
      )}

      {creatingGroup && <CreateGroupModal onClose={() => setCreatingGroup(false)} />}
    </header>
  )
}
