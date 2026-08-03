import { describe, expect, it } from 'vitest'
import { buildAgendaItems } from './agendaItems'
import { parseLocalDate } from './date'
import type { CalendarEvent, ClassCancellation, RecurringClass } from '../types/domain'

const rangeStart = parseLocalDate('2026-08-01')
const rangeEnd = parseLocalDate('2026-08-31')

describe('buildAgendaItems', () => {
  it('includes standalone calendar events within range', () => {
    const event: CalendarEvent = {
      id: 'e1',
      group_id: 'g1',
      type: 'apresentacao',
      title: 'Concerto de Primavera',
      event_date: '2026-08-15',
      time: '19:00',
      venue: 'Teatro',
      description: null,
      color: null,
      related_project_id: null,
    }
    const items = buildAgendaItems([event], [], [], rangeStart, rangeEnd)
    expect(items).toHaveLength(1)
    expect(items[0].source.kind).toBe('event')
  })

  it('expands a recurring class into weekly occurrences and marks cancelled ones', () => {
    const recurringClass: RecurringClass = {
      id: 'c1',
      group_id: 'g1',
      name: 'Ensaio geral',
      class_date: '2026-08-04',
      time: '20:00',
      venue: null,
      description: null,
      is_recurring: true,
      recurrence_end_date: '2026-08-31',
    }
    const cancellation: ClassCancellation = { id: 'x1', class_id: 'c1', occurrence_date: '2026-08-11' }
    const items = buildAgendaItems([], [recurringClass], [cancellation], rangeStart, rangeEnd)

    expect(items.map((i) => i.date)).toEqual(['2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25'])
    const cancelled = items.find((i) => i.date === '2026-08-11')
    expect(cancelled?.source.kind).toBe('class')
    expect(cancelled?.source.kind === 'class' && cancelled.source.cancellationId).toBe('x1')
    const notCancelled = items.find((i) => i.date === '2026-08-04')
    expect(notCancelled?.source.kind === 'class' && notCancelled.source.cancellationId).toBeNull()
  })

  it('sorts merged items chronologically', () => {
    const event: CalendarEvent = {
      id: 'e1',
      group_id: 'g1',
      type: 'outro',
      title: 'Reunião',
      event_date: '2026-08-02',
      time: null,
      venue: null,
      description: null,
      color: null,
      related_project_id: null,
    }
    const recurringClass: RecurringClass = {
      id: 'c1',
      group_id: 'g1',
      name: 'Ensaio',
      class_date: '2026-08-01',
      time: null,
      venue: null,
      description: null,
      is_recurring: false,
      recurrence_end_date: null,
    }
    const items = buildAgendaItems([event], [recurringClass], [], rangeStart, rangeEnd)
    expect(items.map((i) => i.date)).toEqual(['2026-08-01', '2026-08-02'])
  })
})
