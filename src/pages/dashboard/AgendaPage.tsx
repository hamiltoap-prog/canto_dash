import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore, isActiveGroupAdmin } from '../../store/useAppStore'
import { fetchEvents } from '../../api/events'
import { fetchClasses, fetchCancellations, cancelOccurrence, uncancelOccurrence } from '../../api/classes'
import { fetchProjects } from '../../api/projects'
import type { CalendarEvent, ClassCancellation, Project, RecurringClass } from '../../types/domain'
import { buildAgendaItems } from '../../lib/agendaItems'
import { monthBounds, monthLabelPt } from '../../lib/date'
import { PageTitle } from '../../components/layout/PageTitle'
import { LoadingState, ErrorState } from '../../components/ui/AsyncState'
import { MonthCalendar } from '../../components/agenda/MonthCalendar'
import { DayAgendaList } from '../../components/agenda/DayAgendaList'

export function AgendaPage() {
  const activeGroupId = useAppStore((s) => s.activeGroupId)
  const isAdmin = useAppStore(isActiveGroupAdmin)

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [classes, setClasses] = useState<RecurringClass[]>([])
  const [cancellations, setCancellations] = useState<ClassCancellation[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (!activeGroupId) return
    setLoading(true)
    setError(null)
    Promise.all([fetchEvents(activeGroupId), fetchClasses(activeGroupId), fetchCancellations(activeGroupId), fetchProjects(activeGroupId)])
      .then(([e, c, cn, p]) => {
        setEvents(e)
        setClasses(c)
        setCancellations(cn)
        setProjects(p)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar a agenda.'))
      .finally(() => setLoading(false))
  }, [activeGroupId, reloadToken])

  const itemsByDate = useMemo(() => {
    const { start, end } = monthBounds(monthDate)
    const items = buildAgendaItems(events, classes, cancellations, projects, start, end)
    const map = new Map<string, typeof items>()
    for (const item of items) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return map
  }, [events, classes, cancellations, projects, monthDate])

  async function handleCancelOccurrence(classId: string, date: string) {
    if (!classId) return
    const created = await cancelOccurrence(classId, date)
    setCancellations((current) => [...current, created])
  }

  async function handleReactivateOccurrence(cancellationId: string) {
    setCancellations((current) => current.filter((c) => c.id !== cancellationId))
    try {
      await uncancelOccurrence(cancellationId)
    } catch {
      setReloadToken((t) => t + 1)
    }
  }

  function changeMonth(delta: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
    setSelectedDate(null)
  }

  if (loading) return <LoadingState label="Carregando agenda..." />
  if (error) return <ErrorState message={error} onRetry={() => setReloadToken((t) => t + 1)} />

  const dayItems = selectedDate ? (itemsByDate.get(selectedDate) ?? []) : []

  return (
    <div className="flex flex-col gap-4">
      <PageTitle subtitle="Calendário mensal de eventos">Agenda</PageTitle>

      <div className="flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          aria-label="Mês anterior"
          className="flex size-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-[var(--color-text)]">{monthLabelPt(monthDate)}</span>
        <button
          onClick={() => changeMonth(1)}
          aria-label="Próximo mês"
          className="flex size-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <MonthCalendar
        monthDate={monthDate}
        itemsByDate={itemsByDate}
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate((current) => (current === date ? null : date))}
      />

      {selectedDate && (
        <DayAgendaList
          date={selectedDate}
          items={dayItems}
          isAdmin={isAdmin}
          onCancelOccurrence={handleCancelOccurrence}
          onReactivateOccurrence={handleReactivateOccurrence}
        />
      )}

      {!selectedDate && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          {itemsByDate.size > 0 ? 'Toque num dia com evento pra ver os detalhes.' : `Nenhum evento em ${monthLabelPt(monthDate).toLowerCase()}.`}
        </p>
      )}
    </div>
  )
}
