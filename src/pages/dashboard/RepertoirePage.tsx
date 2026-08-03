import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { fetchProjects } from '../../api/projects'
import type { Project } from '../../types/domain'
import { matchesSearch } from '../../lib/text'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/AsyncState'
import { SearchField } from '../../components/ui/SearchField'
import { ProjectCard } from '../../components/repertoire/ProjectCard'
import { PageTitle } from '../../components/layout/PageTitle'

export function RepertoirePage() {
  const activeGroupId = useAppStore((s) => s.activeGroupId)
  const [projects, setProjects] = useState<Project[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!activeGroupId) return
    setLoading(true)
    setError(null)
    fetchProjects(activeGroupId)
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar o repertório.'))
      .finally(() => setLoading(false))
  }, [activeGroupId, reloadToken])

  const filtered = useMemo(() => projects.filter((p) => matchesSearch(p.name, query)), [projects, query])

  if (loading) return <LoadingState label="Carregando repertório..." />
  if (error) return <ErrorState message={error} onRetry={() => setReloadToken((t) => t + 1)} />

  return (
    <div className="flex flex-col gap-4">
      <PageTitle subtitle="Projetos, partituras e áudios-guia por naipe">Repertório</PageTitle>
      <SearchField
        placeholder="Buscar por nome do projeto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={
            projects.length === 0
              ? 'Nenhum projeto cadastrado ainda neste grupo.'
              : 'Nenhum projeto encontrado para essa busca.'
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
