import React, { useState } from 'react'

type Props = {
  onLogin: (credentials: { username: string; password: string }) => Promise<void>
  navigate: (to: string) => void
}

export function LoginPage({ onLogin, navigate }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    if (!username || !password) {
      setError('Username and password are required.')
      setLoading(false)
      return
    }

    try {
      await onLogin({ username, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel auth">
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Username
          <input name="username" placeholder="e.g. admin" required />
        </label>

        <label>
          Password
          <input name="password" type="password" placeholder="Enter password" required />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Don&apos;t have an account?{' '}
        <button type="button" className="link" onClick={() => navigate('/register')}>
          Register
        </button>
      </p>
    </section>
  )
}
