import { useState, type FormEvent } from 'react'
import type { CalendarEvent, CalendarEventType } from '../../types/domain'
import type { CalendarEventInput } from '../../api/events'
import { EVENT_TYPE_LABELS } from '../../lib/eventColors'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { Select } from '../ui/Select'

const TYPE_OPTIONS: CalendarEventType[] = ['aula', 'ensaio', 'apresentacao', 'outro']

interface EventFormProps {
  groupId: string
  initial?: CalendarEvent
  onSave: (input: CalendarEventInput) => Promise<void>
  onCancel: () => void
}

export function EventForm({ groupId, initial, onSave, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<CalendarEventType>(initial?.type ?? 'ensaio')
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '')
  const [time, setTime] = useState(initial?.time ?? '')
  const [venue, setVenue] = useState(initial?.venue ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave({
        group_id: groupId,
        type,
        title: title.trim(),
        event_date: eventDate,
        time: time || null,
        venue: venue.trim() || null,
        description: description.trim() || null,
        color: null,
        related_project_id: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o evento.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <TextField label="Título" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Apresentação de fim de ano" />

      <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as CalendarEventType)}>
        {TYPE_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {EVENT_TYPE_LABELS[t]}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Data" type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        <TextField label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <TextField label="Local" value={venue} onChange={(e) => setVenue(e.target.value)} />
      <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || !title.trim() || !eventDate}>
          {saving ? 'Salvando...' : 'Salvar evento'}
        </Button>
      </div>
    </form>
  )
}
