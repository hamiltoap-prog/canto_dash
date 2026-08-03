import { useEffect, useRef, useState } from 'react'
import { FileText, Music2, Image as ImageIcon, Link2, Trash2, Upload } from 'lucide-react'
import type { ClassMaterial, MaterialKind } from '../../types/domain'
import { createMaterial, deleteMaterial, fetchClassMaterials } from '../../api/classes'
import { uploadGroupFile, removeGroupFile } from '../../api/storage'
import { isLikelyValidUrl, normalizeExternalLink } from '../../lib/externalLink'
import { TextField } from '../ui/TextField'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingState, EmptyState } from '../ui/AsyncState'

const KIND_ICON = { pdf: FileText, audio: Music2, image: ImageIcon, link: Link2 } as const
const KIND_LABELS: Record<MaterialKind, string> = { pdf: 'PDF', audio: 'Áudio', image: 'Imagem', link: 'Link externo' }
const KIND_ACCEPT: Record<MaterialKind, string> = {
  pdf: 'application/pdf',
  audio: 'audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac',
  image: 'image/*',
  link: '',
}

export function ClassMaterialManager({ groupId, classId }: { groupId: string; classId: string }) {
  const [materials, setMaterials] = useState<ClassMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<ClassMaterial | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [label, setLabel] = useState('')
  const [kind, setKind] = useState<MaterialKind>('pdf')
  const [linkValue, setLinkValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchClassMaterials(classId)
      .then(setMaterials)
      .finally(() => setLoading(false))
  }, [classId])

  function resetForm() {
    setLabel('')
    setLinkValue('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAddViaUpload(file: File) {
    if (!label.trim()) {
      setError('Dê um nome pro material antes de enviar o arquivo.')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const url = await uploadGroupFile(groupId, `class-materials/${kind}`, file)
      const created = await createMaterial({ class_id: classId, label: label.trim(), file_url: url, kind })
      setMaterials((current) => [...current, created])
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o arquivo.')
    } finally {
      setAdding(false)
    }
  }

  async function handleAddViaLink() {
    if (!label.trim()) {
      setError('Dê um nome pro material antes de adicionar o link.')
      return
    }
    if (!isLikelyValidUrl(linkValue)) {
      setError('Link inválido — cole a URL completa (com https://).')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const url = normalizeExternalLink(linkValue.trim())
      const created = await createMaterial({ class_id: classId, label: label.trim(), file_url: url, kind })
      setMaterials((current) => [...current, created])
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o link.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteMaterial(pendingDelete.id)
      setMaterials((current) => current.filter((m) => m.id !== pendingDelete.id))
      removeGroupFile(pendingDelete.file_url).catch(() => {})
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-3">
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Nome do material" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Guia de respiração" />
          <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as MaterialKind)}>
            {(Object.keys(KIND_LABELS) as MaterialKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>

        {kind === 'link' ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextField label="Link" type="url" value={linkValue} onChange={(e) => setLinkValue(e.target.value)} placeholder="https://..." />
            </div>
            <Button type="button" onClick={handleAddViaLink} disabled={adding || !label.trim() || !linkValue.trim()}>
              Adicionar
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)]">
              <Upload size={14} />
              {adding ? 'Enviando...' : 'Enviar arquivo'}
              <input
                ref={fileInputRef}
                type="file"
                accept={KIND_ACCEPT[kind]}
                hidden
                disabled={adding}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAddViaUpload(file)
                }}
              />
            </label>
            <div className="flex flex-1 items-end gap-2">
              <div className="flex-1">
                <TextField label="ou link" type="url" value={linkValue} onChange={(e) => setLinkValue(e.target.value)} placeholder="https://..." />
              </div>
              <Button type="button" variant="secondary" onClick={handleAddViaLink} disabled={adding || !label.trim() || !linkValue.trim()}>
                <Link2 size={14} />
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {loading ? (
        <LoadingState label="Carregando materiais..." />
      ) : materials.length === 0 ? (
        <EmptyState message="Nenhum material anexado ainda." />
      ) : (
        <div className="flex flex-col gap-1.5">
          {materials.map((material) => {
            const Icon = KIND_ICON[material.kind]
            return (
              <div
                key={material.id}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-text)]">
                  <Icon size={14} className="shrink-0 text-[var(--color-text-muted)]" />
                  <span className="truncate">{material.label}</span>
                </span>
                <button
                  onClick={() => setPendingDelete(material)}
                  aria-label="Remover material"
                  className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-naipe-soprano-soft)] hover:text-[var(--color-naipe-soprano)]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remover material"
          message={`"${pendingDelete.label}" será removido desta aula.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
