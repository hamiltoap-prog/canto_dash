import { lazy, Suspense, useState } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { Song, Naipe } from '../../types/domain'
import { NAIPE_LABELS, NAIPE_ORDER } from '../../lib/naipe'
import { naipeFileKey } from '../../lib/naipeFile'
import { AudioPlayer } from './AudioPlayer'
import { EmptyState, LoadingState } from '../ui/AsyncState'

// react-pdf pulls in pdf.js, which is large and only needed once a member
// actually opens a sheet-music PDF — load it on demand instead of shipping
// it in the main bundle for everyone.
const PdfViewer = lazy(() => import('./PdfViewer').then((m) => ({ default: m.PdfViewer })))

export function SongListItem({ song, initialNaipe }: { song: Song; initialNaipe: Naipe }) {
  const [expanded, setExpanded] = useState(false)
  const [naipe, setNaipe] = useState<Naipe>(initialNaipe)

  const key = naipeFileKey(naipe)
  const sheetUrl = song.sheet_music[key]
  const audioUrl = song.guide_audio[key]

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-[var(--color-text)]">{song.name}</span>
        <ChevronDown size={16} className={clsx('shrink-0 text-[var(--color-text-muted)] transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4">
          <div className="flex flex-wrap gap-1.5" aria-label="Escolher naipe">
            {NAIPE_ORDER.map((n) => (
              <button
                key={n}
                data-naipe={n}
                onClick={() => setNaipe(n)}
                className={clsx(
                  'rounded-[var(--radius-chip)] border px-2.5 py-1 text-xs font-medium transition-colors',
                  n === naipe
                    ? 'border-[var(--naipe-accent)]/30 bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
                )}
              >
                {NAIPE_LABELS[n]}
              </button>
            ))}
          </div>

          {audioUrl ? (
            <AudioPlayer fileUrl={audioUrl} songId={song.id} naipe={naipe} />
          ) : (
            <EmptyState message={`Sem áudio-guia para ${NAIPE_LABELS[naipe].toLowerCase()}.`} />
          )}

          {sheetUrl ? (
            <Suspense fallback={<LoadingState label="Carregando visualizador de PDF..." />}>
              <PdfViewer fileUrl={sheetUrl} songId={song.id} materialKind="sheet_music" />
            </Suspense>
          ) : (
            <EmptyState message={`Sem partitura para ${NAIPE_LABELS[naipe].toLowerCase()}.`} />
          )}
        </div>
      )}
    </div>
  )
}
