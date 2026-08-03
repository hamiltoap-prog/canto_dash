import { useState, type FormEvent } from 'react'
import { Users, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { signOut } from '../../api/auth'
import { createGroup, fetchMyGroups } from '../../api/groups'
import { useAppStore } from '../../store/useAppStore'

export function NoGroupPage() {
  const setMemberships = useAppStore((s) => s.setMemberships)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createGroup(name.trim(), description.trim() || null)
      const { groups, memberships } = await fetchMyGroups()
      setMemberships(groups, memberships)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o grupo.')
    } finally {
      setSaving(false)
    }
  }

  if (creating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-surface-sunken)] px-6">
        <form onSubmit={handleCreate} className="flex w-full max-w-sm flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-lg font-semibold text-[var(--color-text)]">Criar meu grupo</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Você vira o administrador dele automaticamente.</p>
          </div>
          <TextField label="Nome do grupo" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Coral Vozes da Serra" />
          <TextField
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Coral comunitário, ensaios às terças"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)} disabled={saving}>
              Voltar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()} className="flex-1">
              {saving ? 'Criando...' : 'Criar grupo'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-surface-sunken)] px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]">
        <Users size={26} />
      </div>
      <h1 className="text-lg font-semibold text-[var(--color-text)]">Você ainda não faz parte de um grupo</h1>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        Peça para o administrador do seu coral te adicionar pelo e-mail que você usou no cadastro, ou crie seu
        próprio grupo agora.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => signOut()}>
          Sair
        </Button>
        <Button onClick={() => setCreating(true)}>Criar meu grupo</Button>
      </div>
    </div>
  )
}
