import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { signUp } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthLayout } from './AuthLayout'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Quase lá" subtitle="Confirme seu e-mail para continuar">
        <p className="text-sm text-[var(--color-text)]">
          Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar, um administrador
          precisa te adicionar a um grupo para você começar a usar o painel.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline">
          Voltar para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Depois de criada, um admin te adiciona a um grupo">
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
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </Button>
        <div className="text-center text-sm">
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            Já tenho conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
