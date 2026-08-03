import clsx from 'clsx'
import { formatLocalDate, monthGridDays, WEEKDAY_LABELS_PT } from '../../lib/date'
import { EVENT_TYPE_COLOR_VAR } from '../../lib/eventColors'
import type { AgendaItem } from '../../lib/agendaItems'

interface MonthCalendarProps {
  monthDate: Date
  itemsByDate: Map<string, AgendaItem[]>
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

export function MonthCalendar({ monthDate, itemsByDate, selectedDate, onSelectDate }: MonthCalendarProps) {
  const days = monthGridDays(monthDate)
  const currentMonth = monthDate.getMonth()
  const today = formatLocalDate(new Date())

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[var(--color-text-muted)]">
        {WEEKDAY_LABELS_PT.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = formatLocalDate(day)
          const inMonth = day.getMonth() === currentMonth
          const items = itemsByDate.get(dateStr) ?? []
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={clsx(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] text-xs transition-colors',
                !inMonth && 'text-[var(--color-text-muted)] opacity-40',
                inMonth && !isSelected && 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
                isSelected && 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] ring-1 ring-inset ring-[var(--color-accent)]',
                isToday && !isSelected && 'font-semibold',
              )}
            >
              <span>{day.getDate()}</span>
              {items.length > 0 && (
                <div className="flex gap-0.5">
                  {items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="size-1.5 rounded-full"
                      style={{ background: `var(${EVENT_TYPE_COLOR_VAR[item.type]})` }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
