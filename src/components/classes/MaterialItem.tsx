import { useState } from 'react'
import { FileText, Music2, Image as ImageIcon, Link2, ExternalLink, X } from 'lucide-react'
import type { ClassMaterial } from '../../types/domain'

const KIND_ICON = {
  pdf: FileText,
  audio: Music2,
  image: ImageIcon,
  link: Link2,
} as const

export function MaterialItem({ material }: { material: ClassMaterial }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const Icon = KIND_ICON[material.kind]

  if (material.kind === 'audio') {
    return (
      <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
          <Music2 size={15} className="text-[var(--color-text-muted)]" />
          {material.label}
        </span>
        <audio controls src={material.file_url} className="w-full" />
      </div>
    )
  }

  if (material.kind === 'image') {
    return (
      <>
        <button
          onClick={() => setLightboxOpen(true)}
          className="flex w-full items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
        >
          <ImageIcon size={15} className="shrink-0 text-[var(--color-text-muted)]" />
          <span className="truncate">{material.label}</span>
        </button>
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>
            <img src={material.file_url} alt={material.label} className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" />
          </div>
        )}
      </>
    )
  }

  return (
    <a
      href={material.file_url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
    >
      <Icon size={15} className="shrink-0 text-[var(--color-text-muted)]" />
      <span className="truncate">{material.label}</span>
      <ExternalLink size={13} className="ml-auto shrink-0 text-[var(--color-text-muted)]" />
    </a>
  )
}
