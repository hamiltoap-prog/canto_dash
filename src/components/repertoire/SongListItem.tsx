import { lazy, Suspense, useEffect, useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, Music4 } from 'lucide-react'
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
  const [usePlayback, setUsePlayback] = useState(false)
  const [pdfView, setPdfView] = useState<'partitura' | 'letra'>('partitura')

  // Follow the header's naipe filter — selecting a naipe up top should
  // reflect everywhere, not just in songs mounted afterward.
  useEffect(() => {
    setNaipe(initialNaipe)
  }, [initialNaipe])

  const key = naipeFileKey(naipe)
  const sheetUrl = song.sheet_music[key]
  const audioUrl = usePlayback ? song.guide_audio.playback : song.guide_audio[key]

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
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Escolher naipe">
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
            {song.guide_audio.playback && (
              <>
                <span className="mx-0.5 h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />
                <button
                  onClick={() => setUsePlayback((v) => !v)}
                  className={clsx(
                    'flex items-center gap-1 rounded-[var(--radius-chip)] border px-2.5 py-1 text-xs font-medium transition-colors',
                    usePlayback
                      ? 'border-[var(--naipe-accent)]/30 bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
                  )}
                >
                  <Music4 size={12} />
                  Playback
                </button>
              </>
            )}
          </div>

          {audioUrl ? (
            <AudioPlayer fileUrl={audioUrl} songId={song.id} naipe={naipe} />
          ) : (
            <EmptyState
              message={usePlayback ? 'Sem faixa de playback para esta música.' : `Sem áudio-guia para ${NAIPE_LABELS[naipe].toLowerCase()}.`}
            />
          )}

          {song.lyrics_pdf && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setPdfView('partitura')}
                className={clsx(
                  'rounded-[var(--radius-chip)] border px-2.5 py-1 text-xs font-medium transition-colors',
                  pdfView === 'partitura'
                    ? 'border-[var(--naipe-accent)]/30 bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
                )}
              >
                Partitura
              </button>
              <button
                onClick={() => setPdfView('letra')}
                className={clsx(
                  'rounded-[var(--radius-chip)] border px-2.5 py-1 text-xs font-medium transition-colors',
                  pdfView === 'letra'
                    ? 'border-[var(--naipe-accent)]/30 bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
                )}
              >
                Letra
              </button>
            </div>
          )}

          {pdfView === 'letra' && song.lyrics_pdf ? (
            <Suspense fallback={<LoadingState label="Carregando visualizador de PDF..." />}>
              <PdfViewer fileUrl={song.lyrics_pdf} songId={song.id} materialKind="lyrics" />
            </Suspense>
          ) : sheetUrl ? (
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
