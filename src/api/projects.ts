import { supabase } from '../lib/supabase'
import type { Project } from '../types/domain'

export async function fetchProjects(groupId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('group_id', groupId)
    .order('event_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data ?? []) as Project[]
}

export async function fetchProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle()
  if (error) throw error
  return data as Project | null
}
