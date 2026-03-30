import React, { useState } from 'react'

type Props = {
  onRegister: (payload: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  navigate: (to: string) => void
}

export function RegisterPage({ onRegister, navigate }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      await onRegister({
        username: String(formData.get('username') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? '').trim(),
        confirmPassword: String(formData.get('confirmPassword') ?? '').trim(),
      })

      event.currentTarget.reset()
    }catch (err: any) {
      console.log('ERROR RESPONSE:', err?.response)
      console.log('ERROR DATA:', err?.response?.data)
    
      const response = err?.response
    
      if (response?.data?.detail) {
        const detail = response.data.detail
    
        if (Array.isArray(detail)) {
          const formatted = detail
            .map((d: any) => {
              const field = d.loc?.[d.loc.length - 1] || 'Field'
              return `${field}: ${d.msg}`
            })
            .join('. ')
    
          setError(formatted)
        } else {
          setError(String(detail))
        }
      } else {
        setError(err.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel auth">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Username
          <input name="username" placeholder="Choose a username" required />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="name@company.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Create password" required />
        </label>
        <label>
          Confirm Password
          <input name="confirmPassword" type="password" placeholder="Confirm password" required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p>
        Already registered?{' '}
        <button className="link" type="button" onClick={() => navigate('/login')}>
          Login
        </button>
      </p>
    </section>
  )
}
