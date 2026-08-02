import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthLayout } from './AuthLayout'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o link.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Verifique seu e-mail" subtitle="Enviamos um link para redefinir sua senha">
        <Link to="/login" className="text-sm text-[var(--color-accent)] hover:underline">
          Voltar para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Redefinir senha" subtitle="Enviamos um link de redefinição por e-mail">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar link'}
        </Button>
        <div className="text-center text-sm">
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            Voltar para o login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
