import type { ProjectStatus } from '../../types/domain'
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../../lib/projectStatus'

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const color = PROJECT_STATUS_COLORS[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]"
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
