import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { fetchClasses } from '../../api/classes'
import type { RecurringClass } from '../../types/domain'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/AsyncState'
import { PageTitle } from '../../components/layout/PageTitle'
import { ClassCard } from '../../components/classes/ClassCard'

export function ClassesPage() {
  const activeGroupId = useAppStore((s) => s.activeGroupId)
  const [classes, setClasses] = useState<RecurringClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!activeGroupId) return
    setLoading(true)
    setError(null)
    fetchClasses(activeGroupId)
      .then(setClasses)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar as aulas.'))
      .finally(() => setLoading(false))
  }, [activeGroupId, reloadToken])

  return (
    <div className="flex flex-col gap-4">
      <PageTitle subtitle="Aulas recorrentes e materiais de estudo">Aulas</PageTitle>

      {loading ? (
        <LoadingState label="Carregando aulas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadToken((t) => t + 1)} />
      ) : classes.length === 0 ? (
        <EmptyState message="Nenhuma aula cadastrada ainda neste grupo." />
      ) : (
        <div className="flex flex-col gap-3">
          {classes.map((c) => (
            <ClassCard key={c.id} recurringClass={c} />
          ))}
        </div>
      )}
    </div>
  )
}
