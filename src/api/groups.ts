import { supabase } from '../lib/supabase'
import type { Group, GroupMember } from '../types/domain'

/**
 * Loads the groups the current user belongs to via group_members.
 * RLS on both tables ensures only the caller's own memberships and
 * their groups are ever returned — this is not a client-side filter.
 */
export async function fetchMyGroups(): Promise<{ groups: Group[]; memberships: GroupMember[] }> {
  const { data: memberships, error: membershipError } = await supabase
    .from('group_members')
    .select('user_id, group_id, role')

  if (membershipError) throw membershipError
  const rows = (memberships ?? []) as GroupMember[]
  if (rows.length === 0) return { groups: [], memberships: [] }

  const groupIds = rows.map((m) => m.group_id)
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .eq('active', true)

  if (groupsError) throw groupsError
  return { groups: (groups ?? []) as Group[], memberships: rows }
}
