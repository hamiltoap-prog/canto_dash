import { describe, expect, it } from 'vitest'
import { occurrencesInRange } from './recurrence'
import { parseLocalDate } from './date'
import type { RecurringClass } from '../types/domain'

function makeClass(overrides: Partial<RecurringClass>): RecurringClass {
  return {
    id: 'c1',
    group_id: 'g1',
    name: 'Ensaio de naipe',
    class_date: '2026-08-04', // a Tuesday
    time: null,
    end_time: null,
    venue: null,
    address: null,
    description: null,
    is_recurring: false,
    recurrence_end_date: null,
    ...overrides,
  }
}

describe('occurrencesInRange', () => {
  it('returns the single date for a non-recurring class inside the range', () => {
    const result = occurrencesInRange(makeClass({}), parseLocalDate('2026-08-01'), parseLocalDate('2026-08-31'))
    expect(result).toEqual(['2026-08-04'])
  })

  it('returns nothing for a non-recurring class outside the range', () => {
    const result = occurrencesInRange(makeClass({}), parseLocalDate('2026-09-01'), parseLocalDate('2026-09-30'))
    expect(result).toEqual([])
  })

  it('generates weekly occurrences on the same weekday through the end date', () => {
    const result = occurrencesInRange(
      makeClass({ is_recurring: true, recurrence_end_date: '2026-08-31' }),
      parseLocalDate('2026-08-01'),
      parseLocalDate('2026-08-31'),
    )
    expect(result).toEqual(['2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25'])
  })

  it('steps forward to the first occurrence when the series started before the visible range', () => {
    const result = occurrencesInRange(
      makeClass({ is_recurring: true, recurrence_end_date: '2026-09-30' }),
      parseLocalDate('2026-09-01'),
      parseLocalDate('2026-09-30'),
    )
    // 2026-08-04 + weekly lands on 2026-09-01 (Tuesday)
    expect(result).toEqual(['2026-09-01', '2026-09-08', '2026-09-15', '2026-09-22', '2026-09-29'])
  })

  it('returns nothing once the series has already ended before the visible range', () => {
    const result = occurrencesInRange(
      makeClass({ is_recurring: true, recurrence_end_date: '2026-08-11' }),
      parseLocalDate('2026-09-01'),
      parseLocalDate('2026-09-30'),
    )
    expect(result).toEqual([])
  })
})
