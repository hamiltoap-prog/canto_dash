import { useEffect } from 'react'
import { supabase } from './supabase'
import { useAppStore } from '../store/useAppStore'
import { fetchMyGroups } from '../api/groups'

/** Wires Supabase auth state and group memberships into the central store. Mount once at the app root. */
export function useBootstrapAuth() {
  const setSession = useAppStore((s) => s.setSession)
  const setAuthLoading = useAppStore((s) => s.setAuthLoading)
  const setMemberships = useAppStore((s) => s.setMemberships)
  const setMembershipsLoading = useAppStore((s) => s.setMembershipsLoading)
  const session = useAppStore((s) => s.session)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setAuthLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [setSession, setAuthLoading])

  useEffect(() => {
    if (!session) {
      setMembershipsLoading(false)
      return
    }
    setMembershipsLoading(true)
    fetchMyGroups()
      .then(({ groups, memberships }) => setMemberships(groups, memberships))
      .catch(() => setMemberships([], []))
      .finally(() => setMembershipsLoading(false))
  }, [session, setMemberships, setMembershipsLoading])
}
