import { supabase } from '../lib/supabase'
import type { AudioLoopMarker, Naipe } from '../types/domain'

export async function fetchLoopMarkers(songId: string, naipe: Naipe): Promise<AudioLoopMarker[]> {
  const { data, error } = await supabase
    .from('audio_loop_markers')
    .select('*')
    .eq('song_id', songId)
    .eq('naipe', naipe)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AudioLoopMarker[]
}

export async function saveLoopMarker(
  marker: Pick<AudioLoopMarker, 'song_id' | 'naipe' | 'point_a' | 'point_b' | 'playback_rate' | 'label'>,
): Promise<AudioLoopMarker> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Usuário não autenticado.')

  const { data, error } = await supabase
    .from('audio_loop_markers')
    .insert({ ...marker, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as AudioLoopMarker
}

export async function deleteLoopMarker(id: string): Promise<void> {
  const { error } = await supabase.from('audio_loop_markers').delete().eq('id', id)
  if (error) throw error
}
