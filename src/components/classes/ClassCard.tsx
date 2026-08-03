import { useEffect, useState } from 'react'
import { ChevronDown, CalendarDays, Clock, MapPin } from 'lucide-react'
import clsx from 'clsx'
import type { ClassMaterial, RecurringClass } from '../../types/domain'
import { fetchClassMaterials } from '../../api/classes'
import { formatDisplayDatePt, formatTimeRangePt } from '../../lib/date'
import { LoadingState, EmptyState } from '../ui/AsyncState'
import { MaterialItem } from './MaterialItem'

export function ClassCard({ recurringClass }: { recurringClass: RecurringClass }) {
  const [expanded, setExpanded] = useState(false)
  const [materials, setMaterials] = useState<ClassMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!expanded || loaded) return
    setLoading(true)
    fetchClassMaterials(recurringClass.id)
      .then((data) => {
        setMaterials(data)
        setLoaded(true)
      })
      .finally(() => setLoading(false))
  }, [expanded, loaded, recurringClass.id])

  const timeRange = formatTimeRangePt(recurringClass.time, recurringClass.end_time)
  const mapHref = recurringClass.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(recurringClass.address)}`
    : null

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--color-text)]">{recurringClass.name}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {formatDisplayDatePt(recurringClass.class_date)}
            </span>
            {timeRange && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeRange}
              </span>
            )}
            {recurringClass.venue && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {recurringClass.venue}
              </span>
            )}
          </span>
        </div>
        <ChevronDown size={16} className={clsx('shrink-0 text-[var(--color-text-muted)] transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4">
          {recurringClass.description && <p className="text-sm text-[var(--color-text)]">{recurringClass.description}</p>}
          {mapHref && (
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-1.5 text-sm text-[var(--naipe-accent,var(--color-accent))] hover:underline"
            >
              <MapPin size={13} />
              Ver no mapa
            </a>
          )}

          {loading ? (
            <LoadingState label="Carregando materiais..." />
          ) : materials.length === 0 ? (
            <EmptyState message="Nenhum material anexado a esta aula." />
          ) : (
            <div className="flex flex-col gap-2">
              {materials.map((material) => (
                <MaterialItem key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
