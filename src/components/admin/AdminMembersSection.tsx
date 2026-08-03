import { useEffect, useState, type FormEvent } from 'react'
import { UserMinus, ShieldCheck, Shield } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { fetchGroupMembers, inviteMember, removeMember, updateMemberRole, type GroupMemberWithEmail } from '../../api/members'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingState, ErrorState, EmptyState } from '../ui/AsyncState'

export function AdminMembersSection() {
  const groupId = useAppStore((s) => s.activeGroupId)
  const currentUserId = useAppStore((s) => s.user?.id)

  const [members, setMembers] = useState<GroupMemberWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [pendingRemoval, setPendingRemoval] = useState<GroupMemberWithEmail | null>(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    fetchGroupMembers(groupId)
      .then(setMembers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar os membros.'))
      .finally(() => setLoading(false))
  }, [groupId, reloadToken])

  async function handleInvite(event: FormEvent) {
    event.preventDefault()
    if (!groupId) return
    setInviteError(null)
    setInviting(true)
    try {
      await inviteMember(groupId, inviteEmail.trim())
      setInviteEmail('')
      setReloadToken((t) => t + 1)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Não foi possível adicionar esse membro.')
    } finally {
      setInviting(false)
    }
  }

  async function handleToggleRole(member: GroupMemberWithEmail) {
    if (!groupId) return
    const nextRole = member.role === 'admin' ? 'member' : 'admin'
    setMembers((current) => current.map((m) => (m.user_id === member.user_id ? { ...m, role: nextRole } : m)))
    try {
      await updateMemberRole(groupId, member.user_id, nextRole)
    } catch {
      setReloadToken((t) => t + 1)
    }
  }

  async function handleRemove() {
    if (!groupId || !pendingRemoval) return
    setRemoving(true)
    try {
      await removeMember(groupId, pendingRemoval.user_id)
      setMembers((current) => current.filter((m) => m.user_id !== pendingRemoval.user_id))
      setPendingRemoval(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover esse membro.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleInvite} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <TextField
            label="Adicionar membro pelo e-mail"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="pessoa@exemplo.com"
          />
        </div>
        <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
          {inviting ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </form>
      {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
      <p className="-mt-3 text-xs text-[var(--color-text-muted)]">A pessoa precisa já ter criado uma conta antes de ser adicionada.</p>

      {loading ? (
        <LoadingState label="Carregando membros..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadToken((t) => t + 1)} />
      ) : members.length === 0 ? (
        <EmptyState message="Nenhum membro neste grupo ainda." />
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-text)]">{member.email}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{member.role === 'admin' ? 'Administrador' : 'Membro'}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => handleToggleRole(member)}
                  disabled={member.user_id === currentUserId}
                  aria-label={member.role === 'admin' ? 'Remover papel de admin' : 'Tornar admin'}
                  className="flex size-8 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] disabled:opacity-30"
                >
                  {member.role === 'admin' ? <ShieldCheck size={16} className="text-[var(--color-accent)]" /> : <Shield size={16} />}
                </button>
                <button
                  onClick={() => setPendingRemoval(member)}
                  disabled={member.user_id === currentUserId}
                  aria-label="Remover do grupo"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-naipe-soprano-soft)] hover:text-[var(--color-naipe-soprano)] disabled:opacity-30"
                >
                  <UserMinus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingRemoval && (
        <ConfirmDialog
          title="Remover membro"
          message={`${pendingRemoval.email} perde o acesso a este grupo. Essa ação pode ser desfeita adicionando a pessoa de novo.`}
          confirmLabel="Remover"
          loading={removing}
          onConfirm={handleRemove}
          onCancel={() => setPendingRemoval(null)}
        />
      )}
    </div>
  )
}
