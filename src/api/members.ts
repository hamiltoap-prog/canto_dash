import { supabase } from '../lib/supabase'
import type { MemberRole } from '../types/domain'

export interface GroupMemberWithEmail {
  user_id: string
  role: MemberRole
  email: string
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMemberWithEmail[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, role, profiles(email)')
    .eq('group_id', groupId)

  if (error) throw error
  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { email: string } | { email: string }[] | null
    const email = Array.isArray(profile) ? (profile[0]?.email ?? '') : (profile?.email ?? '')
    return { user_id: row.user_id, role: row.role, email }
  })
}

export async function inviteMember(groupId: string, email: string, role: MemberRole = 'member'): Promise<void> {
  const { error } = await supabase.rpc('invite_member', { p_group_id: groupId, p_email: email, p_role: role })
  if (error) throw error
}

export async function updateMemberRole(groupId: string, userId: string, role: MemberRole): Promise<void> {
  const { error } = await supabase.from('group_members').update({ role }).eq('group_id', groupId).eq('user_id', userId)
  if (error) throw error
}

export async function removeMember(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId)
  if (error) throw error
}
