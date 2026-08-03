import { supabase } from '../lib/supabase'
import type { CalendarEvent } from '../types/domain'

export async function fetchEvents(groupId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('group_id', groupId)
    .order('event_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as CalendarEvent[]
}

export type CalendarEventInput = Omit<CalendarEvent, 'id'>

export async function createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  const { data, error } = await supabase.from('calendar_events').insert(input).select().single()
  if (error) throw error
  return data as CalendarEvent
}

export async function updateEvent(eventId: string, input: Partial<CalendarEventInput>): Promise<CalendarEvent> {
  const { data, error } = await supabase.from('calendar_events').update(input).eq('id', eventId).select().single()
  if (error) throw error
  return data as CalendarEvent
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('calendar_events').delete().eq('id', eventId)
  if (error) throw error
}
