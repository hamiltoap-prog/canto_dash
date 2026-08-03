import { CalendarPlus, Clock, MapPin, Ban, RotateCcw } from 'lucide-react'
import type { AgendaItem } from '../../lib/agendaItems'
import { EVENT_TYPE_COLOR_VAR, EVENT_TYPE_LABELS, EVENT_TYPE_SOFT_VAR } from '../../lib/eventColors'
import { googleCalendarLink } from '../../lib/googleCalendar'
import { formatDisplayDatePt } from '../../lib/date'
import { EmptyState } from '../ui/AsyncState'

interface DayAgendaListProps {
  date: string
  items: AgendaItem[]
  isAdmin: boolean
  onCancelOccurrence: (classId: string, date: string) => void
  onReactivateOccurrence: (cancellationId: string) => void
}

export function DayAgendaList({ date, items, isAdmin, onCancelOccurrence, onReactivateOccurrence }: DayAgendaListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">{formatDisplayDatePt(date)}</h2>

      {items.length === 0 ? (
        <EmptyState message="Nenhum evento neste dia." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const cancelled = item.source.kind === 'class' && item.source.cancellationId !== null
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                style={{ opacity: cancelled ? 0.6 : 1 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span
                      className="w-fit rounded-[var(--radius-chip)] px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        background: `var(${EVENT_TYPE_SOFT_VAR[item.type]})`,
                        color: `var(${EVENT_TYPE_COLOR_VAR[item.type]})`,
                      }}
                    >
                      {EVENT_TYPE_LABELS[item.type]}
                      {cancelled && ' · Cancelada'}
                    </span>
                    <span className={cancelled ? 'text-sm font-medium text-[var(--color-text)] line-through' : 'text-sm font-medium text-[var(--color-text)]'}>
                      {item.title}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  {item.time && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {item.time.slice(0, 5)}
                    </span>
                  )}
                  {item.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {item.venue}
                    </span>
                  )}
                </div>

                {item.description && <p className="text-sm text-[var(--color-text)]">{item.description}</p>}

                <div className="flex flex-wrap items-center gap-2">
                  {!cancelled && (
                    <a
                      href={googleCalendarLink({ title: item.title, dateStr: item.date, time: item.time, venue: item.venue, description: item.description })}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
                    >
                      <CalendarPlus size={13} />
                      Adicionar ao Google Agenda
                    </a>
                  )}

                  {isAdmin && item.source.kind === 'class' && (
                    <>
                      {cancelled ? (
                        <button
                          onClick={() => item.source.kind === 'class' && item.source.cancellationId && onReactivateOccurrence(item.source.cancellationId)}
                          className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
                        >
                          <RotateCcw size={13} />
                          Reativar
                        </button>
                      ) : (
                        <button
                          onClick={() => onCancelOccurrence(item.source.kind === 'class' ? item.source.recurringClass.id : '', item.date)}
                          className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-naipe-soprano)] hover:bg-[var(--color-naipe-soprano-soft)]"
                        >
                          <Ban size={13} />
                          Cancelar esta aula
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
