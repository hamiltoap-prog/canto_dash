import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { createClass, deleteClass, fetchClasses, updateClass, countMaterialsForClass, type RecurringClassInput } from '../../api/classes'
import type { RecurringClass } from '../../types/domain'
import { formatDisplayDatePt } from '../../lib/date'
import { ClassForm } from './ClassForm'
import { ClassMaterialManager } from './ClassMaterialManager'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../ui/AsyncState'

type Mode = { type: 'list' } | { type: 'create' } | { type: 'edit'; classId: string }

export function AdminClassesSection() {
  const groupId = useAppStore((s) => s.activeGroupId)
  const [classes, setClasses] = useState<RecurringClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>({ type: 'list' })
  const [pendingDelete, setPendingDelete] = useState<{ item: RecurringClass; materialCount: number } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    fetchClasses(groupId)
      .then(setClasses)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar as aulas.'))
      .finally(() => setLoading(false))
  }, [groupId])

  if (!groupId) return null

  async function handleCreate(input: RecurringClassInput) {
    const created = await createClass(input)
    setClasses((current) => [...current, created])
    setMode({ type: 'edit', classId: created.id })
  }

  async function handleUpdate(classId: string, input: RecurringClassInput) {
    const updated = await updateClass(classId, input)
    setClasses((current) => current.map((c) => (c.id === classId ? updated : c)))
  }

  async function requestDelete(item: RecurringClass) {
    const materialCount = await countMaterialsForClass(item.id)
    setPendingDelete({ item, materialCount })
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteClass(pendingDelete.item.id)
      setClasses((current) => current.filter((c) => c.id !== pendingDelete.item.id))
      setPendingDelete(null)
      setMode({ type: 'list' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState label="Carregando aulas..." />
  if (error) return <ErrorState message={error} />

  if (mode.type === 'create') {
    return <ClassForm groupId={groupId} onSave={handleCreate} onCancel={() => setMode({ type: 'list' })} />
  }

  if (mode.type === 'edit') {
    const item = classes.find((c) => c.id === mode.classId)
    if (!item) return null
    return (
      <div className="flex flex-col gap-4">
        <ClassForm groupId={groupId} initial={item} onSave={(input) => handleUpdate(item.id, input)} onCancel={() => setMode({ type: 'list' })} />
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Materiais</h3>
          <ClassMaterialManager groupId={groupId} classId={item.id} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setMode({ type: 'create' })} className="self-start">
        <Plus size={15} className="mr-1 inline" />
        Nova aula
      </Button>

      {classes.length === 0 ? (
        <EmptyState message="Nenhuma aula cadastrada ainda." />
      ) : (
        <div className="flex flex-col gap-2">
          {classes.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-[var(--color-text)]">{item.name}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{formatDisplayDatePt(item.class_date)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setMode({ type: 'edit', classId: item.id })}
                  aria-label="Editar"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => requestDelete(item)}
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
          title="Excluir aula"
          message={
            pendingDelete.materialCount > 0
              ? `"${pendingDelete.item.name}" tem ${pendingDelete.materialCount} material(is) anexado(s), que também serão excluídos.`
              : `Tem certeza que quer excluir "${pendingDelete.item.name}"?`
          }
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
