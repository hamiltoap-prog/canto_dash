import { useState, type FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { createGroup, fetchMyGroups } from '../../api/groups'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const setMemberships = useAppStore((s) => s.setMemberships)
  const setActiveGroupId = useAppStore((s) => s.setActiveGroupId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const created = await createGroup(name.trim(), description.trim() || null)
      const { groups, memberships } = await fetchMyGroups()
      setMemberships(groups, memberships)
      setActiveGroupId(created.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o grupo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-raised)]"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-chip)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Criar novo grupo</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Você vira o administrador dele.</p>
          </div>
        </div>
        <TextField label="Nome do grupo" required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Coral Vozes do Vale" />
        <TextField label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? 'Criando...' : 'Criar grupo'}
          </Button>
        </div>
      </form>
    </div>
  )
}
