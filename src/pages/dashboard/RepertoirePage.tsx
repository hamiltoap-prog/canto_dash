import { ListMusic } from 'lucide-react'
import { EmptyState } from '../../components/ui/AsyncState'

export function RepertoirePage() {
  return (
    <EmptyState
      message="O repertório do grupo (projetos, partituras e áudios-guia por naipe) chega na próxima etapa do desenvolvimento."
      action={<ListMusic className="text-[var(--color-text-muted)]" size={20} />}
    />
  )
}
