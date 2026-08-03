import { useState } from 'react'
import { Clock } from 'lucide-react'
import type { AgendaItem } from '../../lib/agendaItems'
import { EVENT_TYPE_COLOR_VAR } from '../../lib/eventColors'
import { formatDisplayDatePt, formatTimeRangePt } from '../../lib/date'
import { EmptyState } from '../ui/AsyncState'
import { EventDetailModal } from './EventDetailModal'

interface DayAgendaListProps {
  date: string
  items: AgendaItem[]
  isAdmin: boolean
  onCancelOccurrence: (classId: string, date: string) => void
  onReactivateOccurrence: (cancellationId: string) => void
}

export function DayAgendaList({ date, items, isAdmin, onCancelOccurrence, onReactivateOccurrence }: DayAgendaListProps) {
  const [selected, setSelected] = useState<AgendaItem | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">{formatDisplayDatePt(date)}</h2>

      {items.length === 0 ? (
        <EmptyState message="Nenhum evento neste dia." />
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            const cancelled = item.source.kind === 'class' && item.source.cancellationId !== null
            const timeRange = formatTimeRangePt(item.time, item.endTime)
            return (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-left hover:bg-[var(--color-surface-raised)]"
                style={{ opacity: cancelled ? 0.6 : 1 }}
              >
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: `var(${EVENT_TYPE_COLOR_VAR[item.type]})` }} />
                <span className={cancelled ? 'flex-1 truncate text-sm font-medium text-[var(--color-text)] line-through' : 'flex-1 truncate text-sm font-medium text-[var(--color-text)]'}>
                  {item.title}
                </span>
                {timeRange && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Clock size={11} />
                    {timeRange}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <EventDetailModal
          item={selected}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onCancelOccurrence={(classId, occurrenceDate) => {
            onCancelOccurrence(classId, occurrenceDate)
            setSelected(null)
          }}
          onReactivateOccurrence={(cancellationId) => {
            onReactivateOccurrence(cancellationId)
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
