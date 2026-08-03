import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Pause, Play, Repeat, Bookmark, Trash2, FlagOff } from 'lucide-react'
import { deleteLoopMarker, fetchLoopMarkers, saveLoopMarker } from '../../api/loopMarkers'
import type { AudioLoopMarker, Naipe } from '../../types/domain'
import { formatTime } from '../../lib/formatTime'

const SPEEDS = [0.75, 1, 1.25] as const

interface AudioPlayerProps {
  fileUrl: string
  songId: string
  naipe: Naipe
}

export function AudioPlayer({ fileUrl, songId, naipe }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState<number>(1)

  const [pointA, setPointA] = useState<number | null>(null)
  const [pointB, setPointB] = useState<number | null>(null)
  const [loopEnabled, setLoopEnabled] = useState(false)

  const [markers, setMarkers] = useState<AudioLoopMarker[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLoopMarkers(songId, naipe)
      .then(setMarkers)
      .catch(() => setMarkers([]))
  }, [songId, naipe])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function onTimeUpdate() {
      if (!audio) return
      setCurrentTime(audio.currentTime)
      if (loopEnabled && pointB !== null && audio.currentTime >= pointB) {
        audio.currentTime = pointA ?? 0
      }
    }
    function onLoadedMetadata() {
      if (audio) setDuration(audio.duration)
    }
    function onPlay() {
      setIsPlaying(true)
    }
    function onPause() {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [loopEnabled, pointA, pointB])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
  }

  function handleSpeed(rate: number) {
    setPlaybackRate(rate)
    if (audioRef.current) audioRef.current.playbackRate = rate
  }

  function handleSeek(value: number) {
    if (audioRef.current) audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  function markA() {
    setPointA(currentTime)
    if (pointB !== null && currentTime >= pointB) setPointB(null)
  }

  function markB() {
    setPointB(currentTime)
  }

  function clearLoop() {
    setPointA(null)
    setPointB(null)
    setLoopEnabled(false)
  }

  async function handleSaveMarker() {
    if (pointA === null || pointB === null) return
    setSaving(true)
    try {
      const created = await saveLoopMarker({
        song_id: songId,
        naipe,
        point_a: pointA,
        point_b: pointB,
        playback_rate: playbackRate,
        label: null,
      })
      setMarkers((current) => [created, ...current])
    } finally {
      setSaving(false)
    }
  }

  function applyMarker(marker: AudioLoopMarker) {
    setPointA(marker.point_a)
    setPointB(marker.point_b)
    setLoopEnabled(true)
    handleSpeed(marker.playback_rate)
    if (audioRef.current) {
      audioRef.current.currentTime = marker.point_a
      audioRef.current.playbackRate = marker.playback_rate
    }
  }

  async function handleDeleteMarker(id: string) {
    setMarkers((current) => current.filter((m) => m.id !== id))
    try {
      await deleteLoopMarker(id)
    } catch {
      fetchLoopMarkers(songId, naipe).then(setMarkers)
    }
  }

  const canLoop = pointA !== null && pointB !== null && pointB > pointA

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
      <audio ref={audioRef} src={fileUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--naipe-accent,var(--color-accent))] text-white"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex flex-1 items-center gap-2">
          <span className="w-9 text-right text-xs tabular-nums text-[var(--color-text-muted)]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="h-1.5 flex-1 accent-[var(--naipe-accent,var(--color-accent))]"
          />
          <span className="w-9 text-xs tabular-nums text-[var(--color-text-muted)]">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] p-0.5">
          {SPEEDS.map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeed(speed)}
              className={clsx(
                'rounded-[calc(var(--radius-chip)-2px)] px-2.5 py-1 text-xs font-medium transition-colors',
                playbackRate === speed
                  ? 'bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]',
              )}
            >
              {speed}×
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={markA}
            className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
          >
            Marcar A {pointA !== null && `(${formatTime(pointA)})`}
          </button>
          <button
            onClick={markB}
            className="rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
          >
            Marcar B {pointB !== null && `(${formatTime(pointB)})`}
          </button>
          <button
            onClick={() => setLoopEnabled((v) => !v)}
            disabled={!canLoop}
            className={clsx(
              'flex items-center gap-1 rounded-[var(--radius-chip)] border px-2.5 py-1 text-xs font-medium disabled:opacity-40',
              loopEnabled
                ? 'border-[var(--naipe-accent)]/30 bg-[var(--naipe-accent-soft)] text-[var(--naipe-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
            )}
          >
            <Repeat size={12} />
            Loop
          </button>
          {(pointA !== null || pointB !== null) && (
            <button
              onClick={clearLoop}
              aria-label="Limpar marcadores"
              className="flex size-7 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
            >
              <FlagOff size={13} />
            </button>
          )}
          {canLoop && (
            <button
              onClick={handleSaveMarker}
              disabled={saving}
              className="flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] disabled:opacity-50"
            >
              <Bookmark size={12} />
              {saving ? 'Salvando...' : 'Salvar trecho'}
            </button>
          )}
        </div>
      </div>

      {markers.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-2.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Trechos salvos</span>
          {markers.map((marker) => (
            <div key={marker.id} className="flex items-center justify-between gap-2 text-sm">
              <button
                onClick={() => applyMarker(marker)}
                className="text-[var(--color-text)] hover:text-[var(--naipe-accent,var(--color-accent))]"
              >
                {formatTime(marker.point_a)} – {formatTime(marker.point_b)}
                <span className="ml-1.5 text-xs text-[var(--color-text-muted)]">({marker.playback_rate}×)</span>
              </button>
              <button
                onClick={() => handleDeleteMarker(marker.id)}
                aria-label="Excluir trecho salvo"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-naipe-soprano)]"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
