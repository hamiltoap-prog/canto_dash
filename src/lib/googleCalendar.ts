import { parseLocalDate, formatLocalDate } from './date'

function toUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

/**
 * Builds a Google Calendar "add event" deep link (no OAuth needed).
 * With a time, uses a 1h UTC-timed event; without one, an all-day event
 * (Google's `dates` end bound is exclusive, so the end is start + 1 day).
 */
export function googleCalendarLink(params: {
  title: string
  dateStr: string
  time?: string | null
  venue?: string | null
  description?: string | null
}): string {
  const { title, dateStr, time, venue, description } = params

  let dates: string
  if (time) {
    const [hours, minutes] = time.split(':').map(Number)
    const start = parseLocalDate(dateStr)
    start.setHours(hours, minutes, 0, 0)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    dates = `${toUtcStamp(start)}/${toUtcStamp(end)}`
  } else {
    const start = parseLocalDate(dateStr)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    dates = `${formatLocalDate(start).replace(/-/g, '')}/${formatLocalDate(end).replace(/-/g, '')}`
  }

  const query = new URLSearchParams({ action: 'TEMPLATE', text: title, dates })
  if (venue) query.set('location', venue)
  if (description) query.set('details', description)

  return `https://calendar.google.com/calendar/render?${query.toString()}`
}
