import { Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { signOut } from '../../api/auth'

export function NoGroupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-surface-sunken)] px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]">
        <Users size={26} />
      </div>
      <h1 className="text-lg font-semibold text-[var(--color-text)]">Você ainda não faz parte de um grupo</h1>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        Peça para o administrador do seu coral te adicionar pelo e-mail que você usou no cadastro. Assim que isso
        acontecer, o grupo aparece aqui automaticamente.
      </p>
      <Button variant="secondary" onClick={() => signOut()}>
        Sair
      </Button>
    </div>
  )
}
