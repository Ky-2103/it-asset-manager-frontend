function trimLeadingSlash(value: string) {
  return value.startsWith('/') ? value.slice(1) : value
}

function resolveApiBaseUrl() {
  return import.meta.env?.VITE_API_BASE_URL ?? ''
}

export const API_BASE_URL = resolveApiBaseUrl()

type ApiErrorDetail = {
  loc?: Array<string | number>
  msg?: string
}

type ApiErrorBody = {
  detail?: string | ApiErrorDetail[]
  message?: string
  error?: string
}

function formatApiDetail(detail: string | ApiErrorDetail[]): string {
  if (typeof detail === 'string') return detail

  const messages = detail
    .map((item) => {
      if (!item?.msg) return null

      const fieldPath = item.loc?.slice(1).join('.')
      return fieldPath ? `${fieldPath}: ${item.msg}` : item.msg
    })
    .filter((message): message is string => Boolean(message))

  return messages.join(' | ')
}

function getApiErrorMessage(rawBody: string, fallbackMessage: string): string {
  try {
    const errorData = JSON.parse(rawBody) as ApiErrorBody
    const detailMessage = errorData.detail ? formatApiDetail(errorData.detail) : ''
    return detailMessage || errorData.message || errorData.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}/${trimLeadingSlash(path)}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    if (trimLeadingSlash(path) === 'login') {
      throw new Error('Invalid username or password')
    }
  
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    throw new Error('UNAUTHORIZED')
  }
  if (!response.ok) {
    // Keep a safe fallback for cases where the backend sends an empty body.
    const fallbackMessage = `Request failed with status ${response.status}`
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    const rawBody = await response.text()

    // Parse structured error payloads (for example FastAPI validation errors).
    if (rawBody.trim() && contentType.includes('json')) {
      throw new Error(getApiErrorMessage(rawBody, fallbackMessage))
    }

    // If it's plain text, surface it directly so the UI shows the backend message.
    if (rawBody.trim() && !contentType.includes('json')) {
      throw new Error(rawBody)
    }

    throw new Error(fallbackMessage)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
