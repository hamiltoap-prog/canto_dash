import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse o painel do seu grupo musical">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/esqueci-senha" className="text-[var(--color-accent)] hover:underline">
            Esqueci minha senha
          </Link>
          <Link to="/cadastro" className="text-[var(--color-accent)] hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
