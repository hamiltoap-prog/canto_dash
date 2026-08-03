import type { CalendarEvent, CalendarEventType, ClassCancellation, RecurringClass } from '../types/domain'
import { occurrencesInRange } from './recurrence'
import { formatLocalDate } from './date'

export interface AgendaItem {
  id: string
  date: string
  type: CalendarEventType
  title: string
  time: string | null
  venue: string | null
  description: string | null
  source: { kind: 'event'; event: CalendarEvent } | { kind: 'class'; recurringClass: RecurringClass; cancellationId: string | null }
}

/** Merges standalone calendar_events with computed occurrences of recurring/one-off classes into a single list, sorted by date. */
export function buildAgendaItems(
  events: CalendarEvent[],
  classes: RecurringClass[],
  cancellations: ClassCancellation[],
  rangeStart: Date,
  rangeEnd: Date,
): AgendaItem[] {
  const items: AgendaItem[] = events
    .filter((e) => e.event_date >= formatLocalDate(rangeStart) && e.event_date <= formatLocalDate(rangeEnd))
    .map((event) => ({
      id: `event-${event.id}`,
      date: event.event_date,
      type: event.type,
      title: event.title,
      time: event.time,
      venue: event.venue,
      description: event.description,
      source: { kind: 'event' as const, event },
    }))

  for (const recurringClass of classes) {
    const dates = occurrencesInRange(recurringClass, rangeStart, rangeEnd)
    for (const date of dates) {
      const cancellation = cancellations.find((c) => c.class_id === recurringClass.id && c.occurrence_date === date)
      items.push({
        id: `class-${recurringClass.id}-${date}`,
        date,
        type: 'aula',
        title: recurringClass.name,
        time: recurringClass.time,
        venue: recurringClass.venue,
        description: recurringClass.description,
        source: { kind: 'class', recurringClass, cancellationId: cancellation?.id ?? null },
      })
    }
  }

  return items.sort((a, b) => a.date.localeCompare(b.date))
}
