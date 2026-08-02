import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useBootstrapAuth } from './lib/useBootstrapAuth'
import { LoadingState } from './components/ui/AsyncState'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { NoGroupPage } from './pages/dashboard/NoGroupPage'
import { DashboardShell } from './components/layout/DashboardShell'
import { RepertoirePage } from './pages/dashboard/RepertoirePage'
import { ProjectDetailPage } from './pages/dashboard/ProjectDetailPage'
import { ClassesPage } from './pages/dashboard/ClassesPage'
import { AgendaPage } from './pages/dashboard/AgendaPage'
import { AdminPage } from './pages/dashboard/AdminPage'

function useAppliedTheme() {
  const theme = useAppStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}

function AuthedArea() {
  const groups = useAppStore((s) => s.groups)
  const membershipsLoading = useAppStore((s) => s.membershipsLoading)

  if (membershipsLoading) return <LoadingState label="Carregando seus grupos..." />
  if (groups.length === 0) return <NoGroupPage />

  return (
    <Routes>
      <Route element={<DashboardShell />}>
        <Route index element={<Navigate to="/repertorio" replace />} />
        <Route path="repertorio" element={<RepertoirePage />} />
        <Route path="repertorio/:projectId" element={<ProjectDetailPage />} />
        <Route path="aulas" element={<ClassesPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function GuestArea() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  useAppliedTheme()
  useBootstrapAuth()

  const session = useAppStore((s) => s.session)
  const authLoading = useAppStore((s) => s.authLoading)

  return (
    <BrowserRouter>
      {authLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <LoadingState label="Carregando..." />
        </div>
      ) : session ? (
        <AuthedArea />
      ) : (
        <GuestArea />
      )}
    </BrowserRouter>
  )
}
