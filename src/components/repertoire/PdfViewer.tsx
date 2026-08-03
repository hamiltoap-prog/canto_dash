import { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import '../../lib/pdfWorker'
import { ChevronLeft, ChevronRight, MessageSquarePlus, Trash2, Lock, Globe } from 'lucide-react'
import clsx from 'clsx'
import { createAnnotation, deleteAnnotation, fetchAnnotations } from '../../api/annotations'
import type { AnnotationVisibility, PdfAnnotation } from '../../types/domain'
import { useAppStore, isActiveGroupAdmin } from '../../store/useAppStore'
import { LoadingState, ErrorState } from '../ui/AsyncState'

interface PdfViewerProps {
  fileUrl: string
  songId: string
  materialKind: PdfAnnotation['material_kind']
}

interface PendingAnnotation {
  x: number
  y: number
}

export function PdfViewer({ fileUrl, songId, materialKind }: PdfViewerProps) {
  const groupId = useAppStore((s) => s.activeGroupId)
  const userId = useAppStore((s) => s.user?.id)
  const isAdmin = useAppStore(isActiveGroupAdmin)

  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([])
  const [annotateMode, setAnnotateMode] = useState(false)
  const [pending, setPending] = useState<PendingAnnotation | null>(null)
  const [draftText, setDraftText] = useState('')
  const [draftVisibility, setDraftVisibility] = useState<AnnotationVisibility>('private')
  const [openAnnotationId, setOpenAnnotationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAnnotations(songId, materialKind)
      .then(setAnnotations)
      .catch(() => setAnnotations([]))
  }, [songId, materialKind])

  useEffect(() => {
    setPending(null)
    setOpenAnnotationId(null)
  }, [page])

  function handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!annotateMode || !overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    setPending({ x, y })
    setOpenAnnotationId(null)
    setDraftText('')
    setDraftVisibility('private')
    setSaveError(null)
  }

  async function handleSave() {
    if (!pending || !draftText.trim()) return
    if (!groupId) {
      setSaveError('Nenhum grupo ativo — recarregue a página e tente de novo.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const created = await createAnnotation({
        group_id: groupId,
        song_id: songId,
        material_kind: materialKind,
        page,
        x: pending.x,
        y: pending.y,
        content: draftText.trim(),
        visibility: isAdmin ? draftVisibility : 'private',
      })
      setAnnotations((current) => [...current, created])
      setPending(null)
      setAnnotateMode(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Não foi possível salvar a anotação.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setAnnotations((current) => current.filter((a) => a.id !== id))
    setOpenAnnotationId(null)
    try {
      await deleteAnnotation(id)
    } catch {
      fetchAnnotations(songId, materialKind).then(setAnnotations)
    }
  }

  const pageAnnotations = annotations.filter((a) => a.page === page)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex size-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] disabled:opacity-30"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-[var(--color-text-muted)]">
            {numPages ? `${page} / ${numPages}` : '...'}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="flex size-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] disabled:opacity-30"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            setAnnotateMode((v) => !v)
            setPending(null)
          }}
          className={clsx(
            'flex items-center gap-1.5 rounded-[var(--radius-chip)] border px-3 py-1.5 text-xs font-medium transition-colors',
            annotateMode
              ? 'border-[var(--naipe-accent)]/30 bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
          )}
        >
          <MessageSquarePlus size={14} />
          {annotateMode ? 'Toque na página para anotar' : 'Anotar'}
        </button>
      </div>

      {loadError && <ErrorState message={loadError} />}

      <div className="relative overflow-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-2">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setLoadError('Não foi possível carregar o PDF.')}
          loading={<LoadingState label="Carregando PDF..." />}
        >
          <div className="relative mx-auto w-fit">
            <Page pageNumber={page} width={640} />
            <div
              ref={overlayRef}
              onClick={handleOverlayClick}
              className={clsx(
                'absolute inset-0 z-20',
                annotateMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none',
              )}
            >
              {pageAnnotations.map((a) => (
                <button
                  key={a.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenAnnotationId((current) => (current === a.id ? null : a.id))
                    setPending(null)
                  }}
                  style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
                  className={clsx(
                    'pointer-events-auto absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-bold shadow-[var(--shadow-card)]',
                    a.visibility === 'public'
                      ? 'border-[var(--naipe-accent)] bg-[var(--naipe-accent)] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]',
                  )}
                  aria-label="Ver anotação"
                >
                  {a.visibility === 'public' ? <Globe size={11} /> : <Lock size={11} />}
                </button>
              ))}

              {pageAnnotations
                .filter((a) => a.id === openAnnotationId)
                .map((a) => (
                  <div
                    key={a.id}
                    style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
                    onClick={(e) => e.stopPropagation()}
                    className="pointer-events-auto absolute z-10 w-56 -translate-x-1/2 translate-y-3 rounded-[var(--radius-control)] border border-[var(--color-border)]
                      bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-raised)]"
                  >
                    <p className="whitespace-pre-wrap">{a.content}</p>
                    {(a.user_id === userId || isAdmin) && (
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-[var(--color-naipe-soprano)] hover:underline"
                      >
                        <Trash2 size={12} />
                        Excluir
                      </button>
                    )}
                  </div>
                ))}

              {pending && (
                <div
                  style={{ left: `${pending.x * 100}%`, top: `${pending.y * 100}%` }}
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto absolute z-10 w-64 -translate-x-1/2 translate-y-3 rounded-[var(--radius-control)] border border-[var(--color-border)]
                    bg-[var(--color-surface)] p-3 shadow-[var(--shadow-raised)]"
                >
                  {saveError && <p className="mb-2 text-xs text-[var(--color-naipe-soprano)]">{saveError}</p>}
                  <textarea
                    autoFocus
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Escreva sua anotação..."
                    rows={3}
                    className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]
                      p-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                  />
                  {isAdmin && (
                    <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <input
                        type="checkbox"
                        checked={draftVisibility === 'public'}
                        onChange={(e) => setDraftVisibility(e.target.checked ? 'public' : 'private')}
                      />
                      Visível para todo o grupo
                    </label>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setPending(null)}
                      className="rounded-[var(--radius-control)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !draftText.trim()}
                      className="rounded-[var(--radius-control)] bg-[var(--naipe-accent,var(--color-accent))] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Document>
      </div>
    </div>
  )
}
