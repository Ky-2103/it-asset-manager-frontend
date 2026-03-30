import { useCallback, useMemo, useState } from 'react'
import { getUserFromToken, login as loginRequest, register as registerRequest } from '../api/auth'
import type { AppUser } from '../types/models'

type AuthSessionState = {
  token: string | null
  currentUser: AppUser | null
}

function getInitialSessionState(): AuthSessionState {
  const token = localStorage.getItem('token')

  if (!token) {
    // Defensive cleanup in case a previous session left stale user data behind.
    localStorage.removeItem('currentUser')
    return { token: null, currentUser: null }
  }

  const currentUser = getUserFromToken(token)

  if (!currentUser) {
    // Expired or malformed tokens should never stay in storage.
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    return { token: null, currentUser: null }
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser))
  return { token, currentUser }
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSessionState>(getInitialSessionState)

  const isAuthenticated = Boolean(session.token && session.currentUser)

  const hasAuthenticatedUser = useCallback(() => {
    return Boolean(session.currentUser && session.token)
  }, [session.currentUser, session.token])

  const hasRole = useCallback(
    (role: AppUser['role']) => {
      return Boolean(session.currentUser && session.currentUser.role === role)
    },
    [session.currentUser],
  )

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const data = await loginRequest(credentials)

    const resolvedToken = data.access_token || data.token

    if (!resolvedToken) {
      throw new Error('Login succeeded but no access token was returned.')
    }

    const resolvedUser = data.user ?? getUserFromToken(resolvedToken)

    if (!resolvedUser) {
      throw new Error('Login succeeded but no user context was returned.')
    }

    localStorage.setItem('token', resolvedToken)
    localStorage.setItem('currentUser', JSON.stringify(resolvedUser))
    setSession({ token: resolvedToken, currentUser: resolvedUser })

    return resolvedUser
  }, [])

  const register = useCallback(
    async (payload: { username: string; email: string; password: string; confirmPassword: string }) => {
      const { username, email, password, confirmPassword } = payload

      if (!username || !email || !password || !confirmPassword) {
        throw new Error('Please complete all registration fields.')
      }

      if (password !== confirmPassword) {
        throw new Error('Password and confirmation do not match.')
      }

      await registerRequest({ username, email, password })
    },
    [],
  )

  const clearSessionState = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    setSession({ token: null, currentUser: null })
  }, [])

  const logout = useCallback(() => {
    clearSessionState()
  }, [clearSessionState])

  return useMemo(
    () => ({
      currentUser: session.currentUser,
      isAuthenticated,
      hasAuthenticatedUser,
      hasRole,
      login,
      register,
      logout,
    }),
    [hasAuthenticatedUser, hasRole, isAuthenticated, login, logout, register, session.currentUser],
  )
}
