import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { ListMusic, GraduationCap, Calendar, Shield } from 'lucide-react'
import { useAppStore, isActiveGroupAdmin } from '../../store/useAppStore'

const TABS = [
  { to: '/repertorio', label: 'Repertório', icon: ListMusic },
  { to: '/aulas', label: 'Aulas', icon: GraduationCap },
  { to: '/agenda', label: 'Agenda', icon: Calendar },
]

export function TabNav() {
  const isAdmin = useAppStore(isActiveGroupAdmin)

  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
                isActive ? 'text-[var(--naipe-accent,var(--color-accent))]' : 'text-[var(--color-text-muted)]',
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
                isActive ? 'text-[var(--naipe-accent,var(--color-accent))]' : 'text-[var(--color-text-muted)]',
              )
            }
          >
            <Shield size={20} />
            Admin
          </NavLink>
        )}
      </div>
    </nav>
  )
}
