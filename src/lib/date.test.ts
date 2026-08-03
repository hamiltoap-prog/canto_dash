import { describe, expect, it } from 'vitest'
import { formatLocalDate, isSameLocalDay, monthGridDays, monthLabelPt, parseLocalDate } from './date'

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

describe('monthGridDays', () => {
  it('returns 42 days starting on a Sunday and covering the whole month', () => {
    const days = monthGridDays(new Date(2026, 7, 15))
    expect(days).toHaveLength(42)
    expect(days[0].getDay()).toBe(0)
    expect(days.some((d) => d.getFullYear() === 2026 && d.getMonth() === 7 && d.getDate() === 1)).toBe(true)
    expect(days.some((d) => d.getFullYear() === 2026 && d.getMonth() === 7 && d.getDate() === 31)).toBe(true)
  })

  it('produces consecutive calendar days with no gaps', () => {
    const days = monthGridDays(new Date(2026, 1, 10))
    for (let i = 1; i < days.length; i++) {
      const diff = days[i].getTime() - days[i - 1].getTime()
      expect(diff).toBe(24 * 60 * 60 * 1000)
    }
  })
})
