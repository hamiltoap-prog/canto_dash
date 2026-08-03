import { useState } from 'react'
import { AdminGroupSection } from '../../components/admin/AdminGroupSection'
import { AdminMembersSection } from '../../components/admin/AdminMembersSection'
import { AdminProjectsSection } from '../../components/admin/AdminProjectsSection'
import { AdminClassesSection } from '../../components/admin/AdminClassesSection'
import { AdminEventsSection } from '../../components/admin/AdminEventsSection'
import { PageTitle } from '../../components/layout/PageTitle'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

const SECTIONS = [
  { value: 'grupo', label: 'Grupo' },
  { value: 'membros', label: 'Membros' },
  { value: 'projetos', label: 'Projetos' },
  { value: 'aulas', label: 'Aulas' },
  { value: 'eventos', label: 'Eventos' },
] as const

type SectionKey = (typeof SECTIONS)[number]['value']

export function AdminPage() {
  const [section, setSection] = useState<SectionKey>('grupo')

  return (
    <div className="flex flex-col gap-4">
      <PageTitle>Painel administrativo</PageTitle>
      <SegmentedControl options={SECTIONS} value={section} onChange={setSection} />

      {section === 'grupo' && <AdminGroupSection />}
      {section === 'membros' && <AdminMembersSection />}
      {section === 'projetos' && <AdminProjectsSection />}
      {section === 'aulas' && <AdminClassesSection />}
      {section === 'eventos' && <AdminEventsSection />}
    </div>
  )
}
