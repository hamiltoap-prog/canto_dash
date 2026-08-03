import { useMemo, useState } from 'react'
import type { Song } from '../../types/domain'
import { matchesSearch } from '../../lib/text'
import { naipeFileKey } from '../../lib/naipeFile'
import { useAppStore } from '../../store/useAppStore'
import { SearchField } from '../ui/SearchField'
import { SegmentedControl } from '../ui/SegmentedControl'
import { EmptyState } from '../ui/AsyncState'
import { SongListItem } from './SongListItem'

type FileTypeFilter = 'todos' | 'partituras' | 'guias'

const FILTERS: { value: FileTypeFilter; label: string }[] = [
  { value: 'todos', label: 'Tudo' },
  { value: 'partituras', label: 'Partituras' },
  { value: 'guias', label: 'Guias' },
]

export function SongList({ songs }: { songs: Song[] }) {
  const naipe = useAppStore((s) => s.naipe)
  const [query, setQuery] = useState('')
  const [fileType, setFileType] = useState<FileTypeFilter>('todos')

  const filtered = useMemo(() => {
    const key = naipeFileKey(naipe)
    return songs.filter((song) => {
      if (!matchesSearch(song.name, query)) return false
      if (fileType === 'partituras') return Boolean(song.sheet_music[key] ?? song.sheet_music.full)
      if (fileType === 'guias') return Boolean(song.guide_audio[key] ?? song.guide_audio.full)
      return true
    })
  }, [songs, query, fileType, naipe])

  return (
    <div className="flex flex-col gap-3">
      <SearchField placeholder="Buscar por nome da música..." value={query} onChange={(e) => setQuery(e.target.value)} />

      <SegmentedControl options={FILTERS} value={fileType} onChange={setFileType} className="w-fit" />

      {filtered.length === 0 ? (
        <EmptyState message="Nenhuma música encontrada." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((song) => (
            <SongListItem key={song.id} song={song} initialNaipe={naipe} />
          ))}
        </div>
      )}
    </div>
  )
}
