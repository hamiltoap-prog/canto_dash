export type Naipe = 'geral' | 'soprano' | 'contralto' | 'tenor' | 'baixo' | 'solo'

export type MemberRole = 'admin' | 'member'

export type ProjectStatus = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'

export type CalendarEventType = 'aula' | 'ensaio' | 'apresentacao' | 'outro'

export type AnnotationVisibility = 'public' | 'private'

export interface Group {
  id: string
  name: string
  description: string | null
  theme_color: string | null
  logo_url: string | null
  active: boolean
}

export interface GroupMember {
  user_id: string
  group_id: string
  role: MemberRole
}

export interface Project {
  id: string
  group_id: string
  name: string
  event_date: string | null
  time: string | null
  venue: string | null
  address: string | null
  description: string | null
  costume_photos: string[]
  color_palette: string[]
  notes: string | null
  status: ProjectStatus
}

export type NaipeFileMap = Partial<Record<Exclude<Naipe, 'geral'>, string>> & { full?: string }

export interface Song {
  id: string
  project_id: string
  name: string
  order: number
  sheet_music: NaipeFileMap
  guide_audio: NaipeFileMap
}

export interface RecurringClass {
  id: string
  group_id: string
  name: string
  class_date: string
  time: string | null
  venue: string | null
  description: string | null
}

export type MaterialKind = 'pdf' | 'audio' | 'image' | 'link'

export interface ClassMaterial {
  id: string
  class_id: string
  label: string
  file_url: string
  kind: MaterialKind
}

export interface CalendarEvent {
  id: string
  group_id: string
  type: CalendarEventType
  title: string
  event_date: string
  time: string | null
  venue: string | null
  description: string | null
  color: string | null
  related_project_id: string | null
}

/** A/B loop + speed practice marker saved per user, per audio source. */
export interface AudioLoopMarker {
  id: string
  user_id: string
  song_id: string
  naipe: Naipe
  label: string | null
  point_a: number
  point_b: number
  playback_rate: number
  created_at: string
}

/** Annotation on a PDF (sheet music or lyrics). Public ones are admin-authored
 *  and visible to the whole group; private ones are visible only to their author. */
export interface PdfAnnotation {
  id: string
  group_id: string
  user_id: string
  song_id: string
  material_kind: 'sheet_music' | 'class_material'
  page: number
  x: number
  y: number
  content: string
  visibility: AnnotationVisibility
  created_at: string
}
