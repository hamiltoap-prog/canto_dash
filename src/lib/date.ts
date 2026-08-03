/**
 * Parses a 'YYYY-MM-DD' string as a local calendar date, not UTC.
 * `new Date('YYYY-MM-DD')` parses as UTC midnight, which shifts to the
 * previous day in any timezone west of UTC — the bug this avoids.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function monthLabelPt(date: Date): string {
  return `${MONTH_NAMES_PT[date.getMonth()]} de ${date.getFullYear()}`
}

/** Formats a 'YYYY-MM-DD' string as 'DD de Mês' (or 'DD de Mês de AAAA' if not the current year). */
export function formatDisplayDatePt(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  const day = date.getDate()
  const month = MONTH_NAMES_PT[date.getMonth()]
  const year = date.getFullYear()
  const currentYear = new Date().getFullYear()
  return year === currentYear ? `${day} de ${month}` : `${day} de ${month} de ${year}`
}

/** Formats a start/end time-of-day pair as "20:00–21:30", or just "20:00" without an end time. */
export function formatTimeRangePt(time: string | null, endTime?: string | null): string | null {
  if (!time) return null
  const start = time.slice(0, 5)
  return endTime ? `${start}–${endTime.slice(0, 5)}` : start
}

export const WEEKDAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** The first and last calendar day of a month (local time), for range-filtering queries. */
export function monthBounds(monthDate: Date): { start: Date; end: Date } {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  return { start, end }
}

/** 42 days (6 full weeks, Sunday-first) covering the month, including the leading/trailing days needed to fill the grid. */
export function monthGridDays(monthDate: Date): Date[] {
  const { start } = monthBounds(monthDate)
  const gridStart = new Date(start)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + i)
    return day
  })
}
