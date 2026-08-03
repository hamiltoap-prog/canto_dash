import { useState } from 'react'
import { Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { signOut } from '../../api/auth'
import { CreateGroupModal } from '../../components/groups/CreateGroupModal'

export function NoGroupPage() {
  const [creating, setCreating] = useState(false)

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

      {creating && <CreateGroupModal onClose={() => setCreating(false)} />}
    </div>
  )
}
