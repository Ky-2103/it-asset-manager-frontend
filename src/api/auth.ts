import { apiRequest } from './http.js'

export type LoginPayload = {
  username: string
  password: string
}

export type RegisterPayload = {
  username: string
  password: string
  email: string
}

export type AuthUser = {
  id: number
  username: string
  email: string
  role: 'admin' | 'regular'
}

export type LoginResponse = {
  access_token?: string
  token?: string
  token_type?: string
  user?: AuthUser
}

type JwtClaims = {
  sub?: string
  username?: string
  role?: 'admin' | 'regular'
  exp?: number
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

function decodeJwtPayload(token: string): JwtClaims | null {
  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtClaims
  } catch {
    return null
  }
}

export function getUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token)
  if (!payload?.sub || !payload.username) return null

  const userId = Number(payload.sub)
  if (!Number.isInteger(userId) || userId <= 0) return null

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return null
  }

  return {
    id: userId,
    username: payload.username,
    email: '',
    role: payload.role === 'admin' ? 'admin' : 'regular',
  }
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function register(payload: RegisterPayload) {
  return apiRequest<AuthUser>('register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
