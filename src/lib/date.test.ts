import { describe, expect, it } from 'vitest'
import { formatLocalDate, isSameLocalDay, monthLabelPt, parseLocalDate } from './date'

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD as a local date, not shifted by UTC', () => {
    const date = parseLocalDate('2026-08-02')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(7)
    expect(date.getDate()).toBe(2)
  })

  it('round-trips through formatLocalDate', () => {
    expect(formatLocalDate(parseLocalDate('2026-01-31'))).toBe('2026-01-31')
  })
})

describe('isSameLocalDay', () => {
  it('matches dates on the same calendar day regardless of time', () => {
    const a = new Date(2026, 7, 2, 23, 59)
    const b = new Date(2026, 7, 2, 0, 1)
    expect(isSameLocalDay(a, b)).toBe(true)
  })

  it('does not match different days', () => {
    const a = new Date(2026, 7, 2)
    const b = new Date(2026, 7, 3)
    expect(isSameLocalDay(a, b)).toBe(false)
  })
})

describe('monthLabelPt', () => {
  it('formats month and year in Portuguese', () => {
    expect(monthLabelPt(new Date(2026, 7, 1))).toBe('Agosto de 2026')
  })
})
