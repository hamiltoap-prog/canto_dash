import { supabase } from '../lib/supabase'
import type { ClassMaterial, RecurringClass } from '../types/domain'

export async function fetchClasses(groupId: string): Promise<RecurringClass[]> {
  const { data, error } = await supabase
    .from('recurring_classes')
    .select('*')
    .eq('group_id', groupId)
    .order('class_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as RecurringClass[]
}

export async function fetchClassMaterials(classId: string): Promise<ClassMaterial[]> {
  const { data, error } = await supabase
    .from('class_materials')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ClassMaterial[]
}

export type RecurringClassInput = Omit<RecurringClass, 'id'>

export async function createClass(input: RecurringClassInput): Promise<RecurringClass> {
  const { data, error } = await supabase.from('recurring_classes').insert(input).select().single()
  if (error) throw error
  return data as RecurringClass
}

export async function updateClass(classId: string, input: Partial<RecurringClassInput>): Promise<RecurringClass> {
  const { data, error } = await supabase.from('recurring_classes').update(input).eq('id', classId).select().single()
  if (error) throw error
  return data as RecurringClass
}

export async function deleteClass(classId: string): Promise<void> {
  const { error } = await supabase.from('recurring_classes').delete().eq('id', classId)
  if (error) throw error
}

export async function countMaterialsForClass(classId: string): Promise<number> {
  const { count, error } = await supabase.from('class_materials').select('id', { count: 'exact', head: true }).eq('class_id', classId)
  if (error) throw error
  return count ?? 0
}

export type ClassMaterialInput = Omit<ClassMaterial, 'id'>

export async function createMaterial(input: ClassMaterialInput): Promise<ClassMaterial> {
  const { data, error } = await supabase.from('class_materials').insert(input).select().single()
  if (error) throw error
  return data as ClassMaterial
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const { error } = await supabase.from('class_materials').delete().eq('id', materialId)
  if (error) throw error
}
