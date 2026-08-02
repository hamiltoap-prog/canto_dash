import { supabase } from '../lib/supabase'
import type { AnnotationVisibility, PdfAnnotation } from '../types/domain'

/**
 * Returns annotations visible to the current user for a given PDF material:
 * every public (admin) annotation for the group, plus the caller's own
 * private ones. RLS enforces this same rule server-side.
 */
export async function fetchAnnotations(
  songId: string,
  materialKind: PdfAnnotation['material_kind'],
): Promise<PdfAnnotation[]> {
  const { data, error } = await supabase
    .from('pdf_annotations')
    .select('*')
    .eq('song_id', songId)
    .eq('material_kind', materialKind)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as PdfAnnotation[]
}

export async function createAnnotation(annotation: {
  group_id: string
  song_id: string
  material_kind: PdfAnnotation['material_kind']
  page: number
  x: number
  y: number
  content: string
  visibility: AnnotationVisibility
}): Promise<PdfAnnotation> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Usuário não autenticado.')

  const { data, error } = await supabase
    .from('pdf_annotations')
    .insert({ ...annotation, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as PdfAnnotation
}

export async function deleteAnnotation(id: string): Promise<void> {
  const { error } = await supabase.from('pdf_annotations').delete().eq('id', id)
  if (error) throw error
}
