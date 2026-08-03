import type { CalendarEventType } from '../types/domain'

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  aula: 'Aula',
  ensaio: 'Ensaio',
  apresentacao: 'Apresentação',
  outro: 'Outro',
}

export const EVENT_TYPE_COLOR_VAR: Record<CalendarEventType, string> = {
  aula: '--color-event-aula',
  ensaio: '--color-event-ensaio',
  apresentacao: '--color-event-apresentacao',
  outro: '--color-event-outro',
}

export const EVENT_TYPE_SOFT_VAR: Record<CalendarEventType, string> = {
  aula: '--color-event-aula-soft',
  ensaio: '--color-event-ensaio-soft',
  apresentacao: '--color-event-apresentacao-soft',
  outro: '--color-event-outro-soft',
}
