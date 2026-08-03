import { useEffect, useRef, useState } from 'react'
import { FileText, Music2, Plus, Trash2, Upload, X } from 'lucide-react'
import type { Naipe, NaipeFileMap, Song } from '../../types/domain'
import { createSong, deleteSong, fetchSongs, updateSong } from '../../api/songs'
import { uploadGroupFile, removeGroupFile } from '../../api/storage'
import { NAIPE_LABELS } from '../../lib/naipe'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingState, EmptyState } from '../ui/AsyncState'

const FILE_COLUMNS: (keyof NaipeFileMap)[] = ['soprano', 'contralto', 'tenor', 'baixo', 'solo', 'full']

const FILE_COLUMN_LABELS: Record<keyof NaipeFileMap, string> = {
  soprano: NAIPE_LABELS.soprano,
  contralto: NAIPE_LABELS.contralto,
  tenor: NAIPE_LABELS.tenor,
  baixo: NAIPE_LABELS.baixo,
  solo: NAIPE_LABELS.solo,
  full: 'Geral',
}

function naipeForPath(key: keyof NaipeFileMap): Naipe {
  return key === 'full' ? 'geral' : key
}

export function SongManager({ groupId, projectId }: { groupId: string; projectId: string }) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [newSongName, setNewSongName] = useState('')
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Song | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchSongs(projectId)
      .then(setSongs)
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleCreateSong() {
    if (!newSongName.trim()) return
    setCreating(true)
    try {
      const song = await createSong({
        project_id: projectId,
        name: newSongName.trim(),
        order: songs.length,
        sheet_music: {},
        guide_audio: {},
      })
      setSongs((current) => [...current, song])
      setNewSongName('')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteSong() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteSong(pendingDelete.id)
      setSongs((current) => current.filter((s) => s.id !== pendingDelete.id))
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  function handleSongUpdated(updated: Song) {
    setSongs((current) => current.map((s) => (s.id === updated.id ? updated : s)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="Nova música"
            value={newSongName}
            onChange={(e) => setNewSongName(e.target.value)}
            placeholder="Nome da música"
          />
        </div>
        <Button type="button" onClick={handleCreateSong} disabled={creating || !newSongName.trim()}>
          <Plus size={15} />
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Carregando músicas..." />
      ) : songs.length === 0 ? (
        <EmptyState message="Nenhuma música cadastrada ainda." />
      ) : (
        <div className="flex flex-col gap-3">
          {songs.map((song) => (
            <SongRow
              key={song.id}
              groupId={groupId}
              song={song}
              onUpdated={handleSongUpdated}
              onDeleteRequest={() => setPendingDelete(song)}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Excluir música"
          message={`"${pendingDelete.name}" será removida, junto com as partituras e áudios cadastrados para ela.`}
          loading={deleting}
          onConfirm={handleDeleteSong}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

function SongRow({
  groupId,
  song,
  onUpdated,
  onDeleteRequest,
}: {
  groupId: string
  song: Song
  onUpdated: (song: Song) => void
  onDeleteRequest: () => void
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function handleUpload(kind: 'sheet_music' | 'guide_audio', key: keyof NaipeFileMap, file: File) {
    const uploadKey = `${kind}-${key}`
    setUploadingKey(uploadKey)
    try {
      const subdir = kind === 'sheet_music' ? `sheet-music/${naipeForPath(key)}` : `guide-audio/${naipeForPath(key)}`
      const url = await uploadGroupFile(groupId, subdir, file)
      const updated = await updateSong(song.id, { [kind]: { ...song[kind], [key]: url } })
      onUpdated(updated)
    } finally {
      setUploadingKey(null)
      const input = fileInputRefs.current[uploadKey]
      if (input) input.value = ''
    }
  }

  async function handleRemoveFile(kind: 'sheet_music' | 'guide_audio', key: keyof NaipeFileMap) {
    const current = song[kind][key]
    if (!current) return
    const next = { ...song[kind] }
    delete next[key]
    const updated = await updateSong(song.id, { [kind]: next })
    onUpdated(updated)
    removeGroupFile(current).catch(() => {})
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text)]">{song.name}</span>
        <button onClick={onDeleteRequest} className="flex size-7 items-center justify-center rounded-[var(--radius-chip)] text-[var(--color-text-muted)] hover:bg-[var(--color-naipe-soprano-soft)] hover:text-[var(--color-naipe-soprano)]">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-xs">
          <thead>
            <tr className="text-left text-[var(--color-text-muted)]">
              <th className="py-1 pr-2 font-medium">Naipe</th>
              <th className="py-1 pr-2 font-medium">
                <span className="inline-flex items-center gap-1">
                  <FileText size={12} /> Partitura
                </span>
              </th>
              <th className="py-1 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Music2 size={12} /> Áudio-guia
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FILE_COLUMNS.map((key) => (
              <tr key={key} className="border-t border-[var(--color-border)]">
                <td className="py-1.5 pr-2 text-[var(--color-text)]">{FILE_COLUMN_LABELS[key]}</td>
                <td className="py-1.5 pr-2">
                  <FileSlot
                    url={song.sheet_music[key]}
                    uploading={uploadingKey === `sheet_music-${key}`}
                    accept="application/pdf"
                    inputRef={(el) => {
                      fileInputRefs.current[`sheet_music-${key}`] = el
                    }}
                    onUpload={(file) => handleUpload('sheet_music', key, file)}
                    onRemove={() => handleRemoveFile('sheet_music', key)}
                  />
                </td>
                <td className="py-1.5">
                  <FileSlot
                    url={song.guide_audio[key]}
                    uploading={uploadingKey === `guide_audio-${key}`}
                    accept="audio/*"
                    inputRef={(el) => {
                      fileInputRefs.current[`guide_audio-${key}`] = el
                    }}
                    onUpload={(file) => handleUpload('guide_audio', key, file)}
                    onRemove={() => handleRemoveFile('guide_audio', key)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FileSlot({
  url,
  uploading,
  accept,
  inputRef,
  onUpload,
  onRemove,
}: {
  url?: string
  uploading: boolean
  accept: string
  inputRef: (el: HTMLInputElement | null) => void
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  if (url) {
    return (
      <div className="flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2 py-1 text-[var(--color-naipe-tenor)]">
        <span>Enviado</span>
        <button onClick={onRemove} aria-label="Remover arquivo" className="text-[var(--color-text-muted)] hover:text-[var(--color-naipe-soprano)]">
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <label className="flex w-fit cursor-pointer items-center gap-1 rounded-[var(--radius-chip)] border border-dashed border-[var(--color-border)] px-2 py-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]">
      <Upload size={12} />
      {uploading ? '...' : 'Enviar'}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
    </label>
  )
}
