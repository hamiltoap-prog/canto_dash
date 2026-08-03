import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { createEvent, deleteEvent, fetchEvents, updateEvent, type CalendarEventInput } from '../../api/events'
import type { CalendarEvent } from '../../types/domain'
import { formatDisplayDatePt } from '../../lib/date'
import { EVENT_TYPE_COLOR_VAR, EVENT_TYPE_LABELS } from '../../lib/eventColors'
import { EventForm } from './EventForm'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../ui/AsyncState'

type Mode = { type: 'list' } | { type: 'create' } | { type: 'edit'; eventId: string }

export function AdminEventsSection() {
  const groupId = useAppStore((s) => s.activeGroupId)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>({ type: 'list' })
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    fetchEvents(groupId)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar os eventos.'))
      .finally(() => setLoading(false))
  }, [groupId])

  if (!groupId) return null

  async function handleCreate(input: CalendarEventInput) {
    const created = await createEvent(input)
    setEvents((current) => [...current, created])
    setMode({ type: 'list' })
  }

  async function handleUpdate(eventId: string, input: CalendarEventInput) {
    const updated = await updateEvent(eventId, input)
    setEvents((current) => current.map((e) => (e.id === eventId ? updated : e)))
    setMode({ type: 'list' })
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteEvent(pendingDelete.id)
      setEvents((current) => current.filter((e) => e.id !== pendingDelete.id))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState label="Carregando eventos..." />
  if (error) return <ErrorState message={error} />

  if (mode.type === 'create') {
    return <EventForm groupId={groupId} onSave={handleCreate} onCancel={() => setMode({ type: 'list' })} />
  }

  if (mode.type === 'edit') {
    const item = events.find((e) => e.id === mode.eventId)
    if (!item) return null
    return <EventForm groupId={groupId} initial={item} onSave={(input) => handleUpdate(item.id, input)} onCancel={() => setMode({ type: 'list' })} />
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[var(--color-text-muted)]">
        Aulas recorrentes já aparecem na Agenda automaticamente (ver aba Aulas) — aqui é pra ensaios, apresentações e outros eventos avulsos.
      </p>
      <Button onClick={() => setMode({ type: 'create' })} className="self-start">
        <Plus size={15} className="mr-1 inline" />
        Novo evento
      </Button>

      {events.length === 0 ? (
        <EmptyState message="Nenhum evento cadastrado ainda." />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: `var(${EVENT_TYPE_COLOR_VAR[item.type]})` }} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-[var(--color-text)]">{item.title}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {EVENT_TYPE_LABELS[item.type]} · {formatDisplayDatePt(item.event_date)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setMode({ type: 'edit', eventId: item.id })}
                  aria-label="Editar"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setPendingDelete(item)}
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
          title="Excluir evento"
          message={`Tem certeza que quer excluir "${pendingDelete.title}"?`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
