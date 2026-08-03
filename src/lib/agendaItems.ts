import type { CalendarEvent, CalendarEventType, ClassCancellation, Project, RecurringClass } from '../types/domain'
import { occurrencesInRange } from './recurrence'
import { formatLocalDate } from './date'

export interface AgendaItem {
  id: string
  date: string
  type: CalendarEventType
  title: string
  time: string | null
  endTime: string | null
  venue: string | null
  address: string | null
  description: string | null
  source:
    | { kind: 'event'; event: CalendarEvent }
    | { kind: 'class'; recurringClass: RecurringClass; cancellationId: string | null }
    | { kind: 'project'; project: Project }
}

/**
 * Merges standalone calendar_events, computed occurrences of recurring/one-off
 * classes, and projects that have a date set — all into one sorted list.
 * Projects aren't materialized as calendar_events rows; a project with a date
 * simply always shows up on the Agenda, same as class occurrences do.
 */
export function buildAgendaItems(
  events: CalendarEvent[],
  classes: RecurringClass[],
  cancellations: ClassCancellation[],
  projects: Project[],
  rangeStart: Date,
  rangeEnd: Date,
): AgendaItem[] {
  const startStr = formatLocalDate(rangeStart)
  const endStr = formatLocalDate(rangeEnd)

  const items: AgendaItem[] = events
    .filter((e) => e.event_date >= startStr && e.event_date <= endStr)
    .map((event) => ({
      id: `event-${event.id}`,
      date: event.event_date,
      type: event.type,
      title: event.title,
      time: event.time,
      endTime: null,
      venue: event.venue,
      address: null,
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
        endTime: recurringClass.end_time,
        venue: recurringClass.venue,
        address: recurringClass.address,
        description: recurringClass.description,
        source: { kind: 'class', recurringClass, cancellationId: cancellation?.id ?? null },
      })
    }
  }

  for (const project of projects) {
    if (!project.event_date) continue
    if (project.event_date < startStr || project.event_date > endStr) continue
    items.push({
      id: `project-${project.id}`,
      date: project.event_date,
      type: 'apresentacao',
      title: project.name,
      time: project.time,
      endTime: null,
      venue: project.venue,
      address: project.address,
      description: project.description,
      source: { kind: 'project', project },
    })
  }

  return items.sort((a, b) => a.date.localeCompare(b.date))
}
