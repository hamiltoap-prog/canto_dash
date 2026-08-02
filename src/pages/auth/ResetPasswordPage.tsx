import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { AuthLayout } from './AuthLayout'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updatePassword(password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Nova senha" subtitle="Você chegou aqui pelo link enviado por e-mail">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthLayout>
  )
}
