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

export type ProjectInput = Omit<Project, 'id'>

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase.from('projects').insert(input).select().single()
  if (error) throw error
  return data as Project
}

export async function updateProject(projectId: string, input: Partial<ProjectInput>): Promise<Project> {
  const { data, error } = await supabase.from('projects').update(input).eq('id', projectId).select().single()
  if (error) throw error
  return data as Project
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) throw error
}
