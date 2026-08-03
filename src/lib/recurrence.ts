import { parseLocalDate, formatLocalDate } from './date'
import type { RecurringClass } from '../types/domain'

/**
 * Weekly occurrence dates (as 'YYYY-MM-DD' strings, same weekday as
 * class_date) that fall within [rangeStart, rangeEnd], inclusive.
 * Occurrences are computed on demand, never stored — editing the class
 * (or its end date) automatically reflects on every future occurrence.
 */
export function occurrencesInRange(recurringClass: RecurringClass, rangeStart: Date, rangeEnd: Date): string[] {
  const start = parseLocalDate(recurringClass.class_date)

  if (!recurringClass.is_recurring) {
    return start >= rangeStart && start <= rangeEnd ? [recurringClass.class_date] : []
  }

  const seriesEnd = recurringClass.recurrence_end_date ? parseLocalDate(recurringClass.recurrence_end_date) : start
  const effectiveEnd = seriesEnd < rangeEnd ? seriesEnd : rangeEnd
  if (effectiveEnd < start) return []

  const cursor = new Date(start)
  while (cursor < rangeStart) {
    cursor.setDate(cursor.getDate() + 7)
  }

  const dates: string[] = []
  while (cursor <= effectiveEnd) {
    dates.push(formatLocalDate(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }
  return dates
}
