import { useState } from 'react'
import clsx from 'clsx'
import { AdminGroupSection } from '../../components/admin/AdminGroupSection'
import { AdminMembersSection } from '../../components/admin/AdminMembersSection'
import { AdminProjectsSection } from '../../components/admin/AdminProjectsSection'
import { AdminClassesSection } from '../../components/admin/AdminClassesSection'
import { PageTitle } from '../../components/layout/PageTitle'

const SECTIONS = [
  { key: 'grupo', label: 'Grupo' },
  { key: 'membros', label: 'Membros' },
  { key: 'projetos', label: 'Projetos' },
  { key: 'aulas', label: 'Aulas' },
] as const

type SectionKey = (typeof SECTIONS)[number]['key']

export function AdminPage() {
  const [section, setSection] = useState<SectionKey>('grupo')

  return (
    <div className="flex flex-col gap-4">
      <PageTitle>Painel administrativo</PageTitle>
      <nav className="flex gap-1.5 border-b border-[var(--color-border)] pb-3" aria-label="Seções do painel administrativo">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={clsx(
              'rounded-[var(--radius-chip)] px-3 py-1.5 text-sm font-medium transition-colors',
              section === s.key
                ? 'bg-[var(--naipe-accent-soft,var(--color-accent-soft))] text-[var(--naipe-accent,var(--color-accent))]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {section === 'grupo' && <AdminGroupSection />}
      {section === 'membros' && <AdminMembersSection />}
      {section === 'projetos' && <AdminProjectsSection />}
      {section === 'aulas' && <AdminClassesSection />}
    </div>
  )
}
