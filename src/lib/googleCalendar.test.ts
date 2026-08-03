import { describe, expect, it } from 'vitest'
import { googleCalendarLink } from './googleCalendar'

describe('googleCalendarLink', () => {
  it('builds an all-day event link when no time is given', () => {
    const url = googleCalendarLink({ title: 'Ensaio', dateStr: '2026-08-04' })
    expect(url).toContain('calendar.google.com/calendar/render')
    expect(url).toContain('dates=20260804%2F20260805')
    expect(url).toContain('text=Ensaio')
  })

  it('builds a timed event link with a 1h duration in UTC', () => {
    const url = googleCalendarLink({ title: 'Ensaio', dateStr: '2026-08-04', time: '19:00' })
    const params = new URL(url).searchParams
    const [start, end] = params.get('dates')!.split('/')
    expect(start).toMatch(/^\d{8}T\d{6}Z$/)
    expect(end).toMatch(/^\d{8}T\d{6}Z$/)
  })

  it('includes venue and description when provided', () => {
    const url = googleCalendarLink({ title: 'Ensaio', dateStr: '2026-08-04', venue: 'Igreja Matriz', description: 'Levar partitura' })
    const params = new URL(url).searchParams
    expect(params.get('location')).toBe('Igreja Matriz')
    expect(params.get('details')).toBe('Levar partitura')
  })
})
