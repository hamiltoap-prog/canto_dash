import { FileText, Music2 } from 'lucide-react'
import clsx from 'clsx'
import type { Song } from '../../types/domain'
import { NAIPE_LABELS } from '../../lib/naipe'

const NAIPE_COLUMNS = ['soprano', 'contralto', 'tenor', 'baixo', 'solo'] as const

export function AvailabilityMatrix({ songs }: { songs: Song[] }) {
  if (songs.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
            <th className="px-3.5 py-2.5 font-medium">Música</th>
            {NAIPE_COLUMNS.map((n) => (
              <th key={n} data-naipe={n} className="px-2 py-2.5 text-center font-medium">
                {NAIPE_LABELS[n]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-3.5 py-2.5 text-[var(--color-text)]">{song.name}</td>
              {NAIPE_COLUMNS.map((n) => {
                const hasSheet = Boolean(song.sheet_music[n])
                const hasAudio = Boolean(song.guide_audio[n])
                return (
                  <td key={n} data-naipe={n} className="px-2 py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <FileText
                        size={15}
                        className={clsx(hasSheet ? 'text-[var(--naipe-accent)]' : 'text-[var(--color-border)]')}
                        aria-label={hasSheet ? 'Partitura disponível' : 'Sem partitura'}
                      />
                      <Music2
                        size={15}
                        className={clsx(hasAudio ? 'text-[var(--naipe-accent)]' : 'text-[var(--color-border)]')}
                        aria-label={hasAudio ? 'Áudio-guia disponível' : 'Sem áudio-guia'}
                      />
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
