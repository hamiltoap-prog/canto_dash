import { useState, type FormEvent } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { fetchMyGroups, updateGroup } from '../../api/groups'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

export function AdminGroupSection() {
  const activeGroupId = useAppStore((s) => s.activeGroupId)
  const group = useAppStore((s) => s.groups.find((g) => g.id === activeGroupId))
  const setMemberships = useAppStore((s) => s.setMemberships)

  const [name, setName] = useState(group?.name ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!activeGroupId || !group) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      await updateGroup(activeGroupId!, { name: name.trim(), description: description.trim() || null })
      const { groups, memberships } = await fetchMyGroups()
      setMemberships(groups, memberships)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <TextField label="Nome do grupo" required value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && !error && <p className="text-sm text-[var(--color-naipe-tenor)]">Salvo.</p>}
      <Button type="submit" disabled={saving || !name.trim()} className="self-start">
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
