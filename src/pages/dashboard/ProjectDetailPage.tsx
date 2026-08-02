import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import { fetchProject } from '../../api/projects'
import { fetchSongs } from '../../api/songs'
import type { Project, Song } from '../../types/domain'
import { formatDisplayDatePt } from '../../lib/date'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/AsyncState'
import { StatusBadge } from '../../components/repertoire/StatusBadge'
import { AvailabilityMatrix } from '../../components/repertoire/AvailabilityMatrix'
import { ColorPalette } from '../../components/repertoire/ColorPalette'
import { CostumeGallery } from '../../components/repertoire/CostumeGallery'
import { SongList } from '../../components/repertoire/SongList'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    Promise.all([fetchProject(projectId), fetchSongs(projectId)])
      .then(([proj, songList]) => {
        setProject(proj)
        setSongs(songList)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar o projeto.'))
      .finally(() => setLoading(false))
  }, [projectId, reloadToken])

  if (loading) return <LoadingState label="Carregando projeto..." />
  if (error) return <ErrorState message={error} onRetry={() => setReloadToken((t) => t + 1)} />
  if (!project) return <EmptyState message="Projeto não encontrado." />

  const mapHref = project.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`
    : null

  return (
    <div className="flex flex-col gap-5">
      <Link to="/repertorio" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft size={15} />
        Repertório
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
          {project.event_date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {formatDisplayDatePt(project.event_date)}
            </span>
          )}
          {project.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {mapHref ? (
                <a href={mapHref} target="_blank" rel="noreferrer" className="hover:text-[var(--color-accent)] hover:underline">
                  {project.venue}
                </a>
              ) : (
                project.venue
              )}
            </span>
          )}
        </div>

        {project.description && <p className="text-sm text-[var(--color-text)]">{project.description}</p>}
      </div>

      {project.color_palette.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Paleta do figurino</h2>
          <ColorPalette colors={project.color_palette} />
        </section>
      )}

      {project.costume_photos.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Figurino</h2>
          <CostumeGallery photos={project.costume_photos} />
        </section>
      )}

      {songs.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Disponibilidade por naipe</h2>
          <AvailabilityMatrix songs={songs} />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Músicas</h2>
        {songs.length === 0 ? <EmptyState message="Nenhuma música cadastrada neste projeto ainda." /> : <SongList songs={songs} />}
      </section>
    </div>
  )
}
