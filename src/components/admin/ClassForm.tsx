import { useState, type FormEvent } from 'react'
import type { RecurringClass } from '../../types/domain'
import type { RecurringClassInput } from '../../api/classes'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

interface ClassFormProps {
  groupId: string
  initial?: RecurringClass
  onSave: (input: RecurringClassInput) => Promise<void>
  onCancel: () => void
}

export function ClassForm({ groupId, initial, onSave, onCancel }: ClassFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [classDate, setClassDate] = useState(initial?.class_date ?? '')
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
        name: name.trim(),
        class_date: classDate,
        time: time || null,
        venue: venue.trim() || null,
        description: description.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a aula.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <TextField label="Nome da aula" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ensaio de naipe" />

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Data" type="date" required value={classDate} onChange={(e) => setClassDate(e.target.value)} />
        <TextField label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <TextField label="Local" value={venue} onChange={(e) => setVenue(e.target.value)} />
      <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || !name.trim() || !classDate}>
          {saving ? 'Salvando...' : 'Salvar aula'}
        </Button>
      </div>
    </form>
  )
}
