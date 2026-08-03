import { EmptyState } from '../../components/ui/AsyncState'
import { PageTitle } from '../../components/layout/PageTitle'

export function ClassesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle>Aulas</PageTitle>
      <EmptyState message="As aulas recorrentes e seus materiais de estudo chegam na próxima etapa." />
    </div>
  )
}
