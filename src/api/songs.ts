import { supabase } from '../lib/supabase'
import type { Song } from '../types/domain'

export async function fetchSongs(projectId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (error) throw error
  return (data ?? []) as Song[]
}

export type SongInput = Omit<Song, 'id'>

export async function createSong(input: SongInput): Promise<Song> {
  const { data, error } = await supabase.from('songs').insert(input).select().single()
  if (error) throw error
  return data as Song
}

export async function updateSong(songId: string, input: Partial<SongInput>): Promise<Song> {
  const { data, error } = await supabase.from('songs').update(input).eq('id', songId).select().single()
  if (error) throw error
  return data as Song
}

export async function deleteSong(songId: string): Promise<void> {
  const { error } = await supabase.from('songs').delete().eq('id', songId)
  if (error) throw error
}

export async function countSongsForProject(projectId: string): Promise<number> {
  const { count, error } = await supabase.from('songs').select('id', { count: 'exact', head: true }).eq('project_id', projectId)
  if (error) throw error
  return count ?? 0
}
