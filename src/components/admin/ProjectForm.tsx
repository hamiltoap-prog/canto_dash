import { useRef, useState, type FormEvent } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import type { Project, ProjectStatus } from '../../types/domain'
import type { ProjectInput } from '../../api/projects'
import { PROJECT_STATUS_LABELS } from '../../lib/projectStatus'
import { uploadGroupFile, removeGroupFile } from '../../api/storage'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { Select } from '../ui/Select'

const STATUS_OPTIONS: ProjectStatus[] = ['planejado', 'em_andamento', 'concluido', 'cancelado']

interface ProjectFormProps {
  groupId: string
  initial?: Project
  onSave: (input: ProjectInput) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ groupId, initial, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '')
  const [time, setTime] = useState(initial?.time ?? '')
  const [venue, setVenue] = useState(initial?.venue ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'planejado')
  const [colorPalette, setColorPalette] = useState<string[]>(initial?.color_palette ?? [])
  const [costumePhotos, setCostumePhotos] = useState<string[]>(initial?.costume_photos ?? [])

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addColor() {
    setColorPalette((c) => [...c, '#0a5fd9'])
  }
  function updateColor(index: number, value: string) {
    setColorPalette((c) => c.map((color, i) => (i === index ? value : color)))
  }
  function removeColor(index: number) {
    setColorPalette((c) => c.filter((_, i) => i !== index))
  }

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadGroupFile(groupId, 'costumes', file)))
      setCostumePhotos((current) => [...current, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function removePhoto(url: string) {
    setCostumePhotos((current) => current.filter((p) => p !== url))
    removeGroupFile(url).catch(() => {})
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave({
        group_id: groupId,
        name: name.trim(),
        event_date: eventDate || null,
        time: time || null,
        venue: venue.trim() || null,
        address: address.trim() || null,
        description: description.trim() || null,
        costume_photos: costumePhotos,
        color_palette: colorPalette,
        notes: initial?.notes ?? null,
        status,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o projeto.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <TextField label="Nome do projeto" required value={name} onChange={(e) => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Data" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        <TextField label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <TextField label="Local" value={venue} onChange={(e) => setVenue(e.target.value)} />
      <TextField label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Usado no link de mapa" />
      <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />

      <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {PROJECT_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--color-text)]">Paleta de cores do figurino</span>
        <div className="flex flex-wrap gap-2">
          {colorPalette.map((color, index) => (
            <div key={index} className="flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] p-1">
              <input type="color" value={color} onChange={(e) => updateColor(index, e.target.value)} className="size-6 cursor-pointer" />
              <button type="button" onClick={() => removeColor(index)} className="pr-1 text-[var(--color-text-muted)] hover:text-[var(--color-naipe-soprano)]">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addColor}
            className="flex items-center gap-1 rounded-[var(--radius-chip)] border border-dashed border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
          >
            <Plus size={13} />
            Cor
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--color-text)]">Fotos do figurino</span>
        <div className="flex flex-wrap gap-2">
          {costumePhotos.map((url) => (
            <div key={url} className="group relative size-16 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)]">
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex size-16 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] disabled:opacity-50"
          >
            <Upload size={15} />
            <span className="text-[10px]">{uploading ? '...' : 'Enviar'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFileSelect(e.target.files)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || uploading || !name.trim()}>
          {saving ? 'Salvando...' : 'Salvar projeto'}
        </Button>
      </div>
    </form>
  )
}
