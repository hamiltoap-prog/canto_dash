import { EmptyState } from '../../components/ui/AsyncState'
import { PageTitle } from '../../components/layout/PageTitle'

export function AgendaPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle>Agenda</PageTitle>
      <EmptyState message="O calendário mensal de eventos chega na próxima etapa." />
    </div>
  )
}
