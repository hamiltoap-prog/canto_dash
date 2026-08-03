import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { createProject, deleteProject, fetchProjects, updateProject, type ProjectInput } from '../../api/projects'
import { countSongsForProject } from '../../api/songs'
import type { Project } from '../../types/domain'
import { StatusBadge } from '../repertoire/StatusBadge'
import { ProjectForm } from './ProjectForm'
import { SongManager } from './SongManager'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../ui/AsyncState'

type Mode = { type: 'list' } | { type: 'create' } | { type: 'edit'; projectId: string }

export function AdminProjectsSection() {
  const groupId = useAppStore((s) => s.activeGroupId)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>({ type: 'list' })
  const [pendingDelete, setPendingDelete] = useState<{ project: Project; songCount: number } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    fetchProjects(groupId)
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar os projetos.'))
      .finally(() => setLoading(false))
  }, [groupId])

  if (!groupId) return null

  async function handleCreate(input: ProjectInput) {
    const created = await createProject(input)
    setProjects((current) => [...current, created])
    setMode({ type: 'edit', projectId: created.id })
  }

  async function handleUpdate(projectId: string, input: ProjectInput) {
    const updated = await updateProject(projectId, input)
    setProjects((current) => current.map((p) => (p.id === projectId ? updated : p)))
  }

  async function requestDelete(project: Project) {
    const songCount = await countSongsForProject(project.id)
    setPendingDelete({ project, songCount })
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteProject(pendingDelete.project.id)
      setProjects((current) => current.filter((p) => p.id !== pendingDelete.project.id))
      setPendingDelete(null)
      setMode({ type: 'list' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState label="Carregando projetos..." />
  if (error) return <ErrorState message={error} />

  if (mode.type === 'create') {
    return <ProjectForm groupId={groupId} onSave={handleCreate} onCancel={() => setMode({ type: 'list' })} />
  }

  if (mode.type === 'edit') {
    const project = projects.find((p) => p.id === mode.projectId)
    if (!project) return null
    return (
      <div className="flex flex-col gap-4">
        <ProjectForm
          groupId={groupId}
          initial={project}
          onSave={(input) => handleUpdate(project.id, input)}
          onCancel={() => setMode({ type: 'list' })}
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Músicas</h3>
          <SongManager groupId={groupId} projectId={project.id} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setMode({ type: 'create' })} className="self-start">
        <Plus size={15} className="mr-1 inline" />
        Novo projeto
      </Button>

      {projects.length === 0 ? (
        <EmptyState message="Nenhum projeto cadastrado ainda." />
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium text-[var(--color-text)]">{project.name}</span>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setMode({ type: 'edit', projectId: project.id })}
                  aria-label="Editar"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => requestDelete(project)}
                  aria-label="Excluir"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-naipe-soprano-soft)] hover:text-[var(--color-naipe-soprano)]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Excluir projeto"
          message={
            pendingDelete.songCount > 0
              ? `"${pendingDelete.project.name}" tem ${pendingDelete.songCount} música(s) associada(s), que também serão excluídas.`
              : `Tem certeza que quer excluir "${pendingDelete.project.name}"?`
          }
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
