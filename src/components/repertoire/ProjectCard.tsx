import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import type { Project } from '../../types/domain'
import { formatDisplayDatePt } from '../../lib/date'
import { StatusBadge } from './StatusBadge'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/repertorio/${project.id}`}
      className="block rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]
        p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[var(--color-text)]">{project.name}</h3>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-2.5 flex flex-col gap-1 text-sm text-[var(--color-text-muted)]">
        {project.event_date && (
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} />
            {formatDisplayDatePt(project.event_date)}
          </span>
        )}
        {project.venue && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {project.venue}
          </span>
        )}
      </div>
    </Link>
  )
}
