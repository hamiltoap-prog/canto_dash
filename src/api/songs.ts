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
