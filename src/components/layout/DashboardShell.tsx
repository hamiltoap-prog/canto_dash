import { Outlet } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { Header } from './Header'
import { TabNav } from './TabNav'

export function DashboardShell() {
  const naipe = useAppStore((s) => s.naipe)

  return (
    <div data-naipe={naipe} className="flex min-h-screen flex-col bg-[var(--color-surface-sunken)]">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4">
        <Outlet />
      </main>
      <TabNav />
    </div>
  )
}
