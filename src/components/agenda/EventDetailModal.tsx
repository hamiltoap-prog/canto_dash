import { Link } from 'react-router-dom'
import { CalendarPlus, Clock, MapPin, Ban, RotateCcw, X, ListMusic } from 'lucide-react'
import type { AgendaItem } from '../../lib/agendaItems'
import { EVENT_TYPE_COLOR_VAR, EVENT_TYPE_LABELS, EVENT_TYPE_SOFT_VAR } from '../../lib/eventColors'
import { googleCalendarLink } from '../../lib/googleCalendar'
import { formatDisplayDatePt, formatTimeRangePt } from '../../lib/date'
import { Button } from '../ui/Button'

interface EventDetailModalProps {
  item: AgendaItem
  isAdmin: boolean
  onClose: () => void
  onCancelOccurrence: (classId: string, date: string) => void
  onReactivateOccurrence: (cancellationId: string) => void
}

export function EventDetailModal({ item, isAdmin, onClose, onCancelOccurrence, onReactivateOccurrence }: EventDetailModalProps) {
  const cancelled = item.source.kind === 'class' && item.source.cancellationId !== null
  const timeRange = formatTimeRangePt(item.time, item.endTime)
  const mapHref = item.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}` : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-raised)]"
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className="w-fit rounded-[var(--radius-chip)] px-2 py-0.5 text-[11px] font-medium"
            style={{ background: `var(${EVENT_TYPE_SOFT_VAR[item.type]})`, color: `var(${EVENT_TYPE_COLOR_VAR[item.type]})` }}
          >
            {EVENT_TYPE_LABELS[item.type]}
            {cancelled && ' · Cancelada'}
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
          >
            <X size={15} />
          </button>
        </div>

        <h2 className={cancelled ? 'mt-2 text-lg font-semibold text-[var(--color-text)] line-through' : 'mt-2 text-lg font-semibold text-[var(--color-text)]'}>
          {item.title}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">{formatDisplayDatePt(item.date)}</p>

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-[var(--color-text)]">
          {timeRange && (
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-[var(--color-text-muted)]" />
              {timeRange}
            </span>
          )}
          {item.venue && (
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--color-text-muted)]" />
              {mapHref ? (
                <a href={mapHref} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline">
                  {item.venue}
                </a>
              ) : (
                item.venue
              )}
            </span>
          )}
          {item.source.kind === 'project' && (
            <Link
              to={`/repertorio/${item.source.project.id}`}
              className="flex items-center gap-2 text-[var(--color-accent)] hover:underline"
            >
              <ListMusic size={14} />
              Ver no repertório
            </Link>
          )}
        </div>

        {item.description && <p className="mt-3 text-sm text-[var(--color-text)]">{item.description}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!cancelled && (
            <a
              href={googleCalendarLink({ title: item.title, dateStr: item.date, time: item.time, venue: item.venue, description: item.description })}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
            >
              <CalendarPlus size={13} />
              Adicionar ao Google Agenda
            </a>
          )}

          {isAdmin && item.source.kind === 'class' && (
            <>
              {cancelled ? (
                <Button
                  variant="secondary"
                  onClick={() => item.source.kind === 'class' && item.source.cancellationId && onReactivateOccurrence(item.source.cancellationId)}
                >
                  <RotateCcw size={13} className="mr-1.5 inline" />
                  Reativar
                </Button>
              ) : (
                <Button variant="danger" onClick={() => onCancelOccurrence(item.source.kind === 'class' ? item.source.recurringClass.id : '', item.date)}>
                  <Ban size={13} className="mr-1.5 inline" />
                  Cancelar esta aula
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
