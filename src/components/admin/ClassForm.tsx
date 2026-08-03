import { useState, type FormEvent } from 'react'
import { Repeat } from 'lucide-react'
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
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initial?.recurrence_end_date ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (isRecurring && !recurrenceEndDate) {
      setError('Defina até quando a aula se repete.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        group_id: groupId,
        name: name.trim(),
        class_date: classDate,
        time: time || null,
        venue: venue.trim() || null,
        description: description.trim() || null,
        is_recurring: isRecurring,
        recurrence_end_date: isRecurring ? recurrenceEndDate : null,
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
        <TextField label={isRecurring ? 'Primeira data' : 'Data'} type="date" required value={classDate} onChange={(e) => setClassDate(e.target.value)} />
        <TextField label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <TextField label="Local" value={venue} onChange={(e) => setVenue(e.target.value)} />
      <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          <Repeat size={14} className="text-[var(--color-text-muted)]" />
          Aula recorrente (semanal)
        </label>
        {isRecurring && (
          <TextField
            label="Repete até"
            type="date"
            required
            value={recurrenceEndDate}
            min={classDate || undefined}
            onChange={(e) => setRecurrenceEndDate(e.target.value)}
          />
        )}
        <p className="text-xs text-[var(--color-text-muted)]">
          {isRecurring
            ? 'Vai aparecer na Agenda toda semana, no mesmo dia, até a data acima. Dá pra cancelar uma ocorrência específica direto na Agenda.'
            : 'Aula única, só nesta data.'}
        </p>
      </div>

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
