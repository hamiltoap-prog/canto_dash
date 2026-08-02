import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Group, GroupMember, Naipe } from '../types/domain'

export type Theme = 'light' | 'dark'

interface AppState {
  // --- auth slice ---
  session: Session | null
  user: User | null
  authLoading: boolean
  setSession: (session: Session | null) => void
  setAuthLoading: (loading: boolean) => void

  // --- membership slice ---
  groups: Group[]
  memberships: GroupMember[]
  activeGroupId: string | null
  membershipsLoading: boolean
  setMemberships: (groups: Group[], memberships: GroupMember[]) => void
  setActiveGroupId: (groupId: string | null) => void
  setMembershipsLoading: (loading: boolean) => void

  // --- ui slice ---
  theme: Theme
  naipe: Naipe
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setNaipe: (naipe: Naipe) => void
}

const THEME_STORAGE_KEY = 'canto-dash:theme'

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppStore = create<AppState>((set, get) => ({
  session: null,
  user: null,
  authLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  groups: [],
  memberships: [],
  activeGroupId: null,
  membershipsLoading: true,
  setMemberships: (groups, memberships) => {
    const current = get().activeGroupId
    const stillValid = current && groups.some((g) => g.id === current)
    set({
      groups,
      memberships,
      activeGroupId: stillValid ? current : (groups[0]?.id ?? null),
    })
  },
  setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
  setMembershipsLoading: (membershipsLoading) => set({ membershipsLoading }),

  theme: readStoredTheme(),
  naipe: 'geral',
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),
  setNaipe: (naipe) => set({ naipe }),
}))

export function isActiveGroupAdmin(state: AppState): boolean {
  return state.memberships.some((m) => m.group_id === state.activeGroupId && m.role === 'admin')
}
