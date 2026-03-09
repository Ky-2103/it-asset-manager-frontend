function trimLeadingSlash(value: string) {
  return value.startsWith('/') ? value.slice(1) : value
}

function resolveApiBaseUrl() {
  return import.meta.env?.VITE_API_BASE_URL ?? ''
}


export const API_BASE_URL = resolveApiBaseUrl()

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
    const fallbackMessage = `Request failed with status ${response.status}`
  
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    const rawBody = await response.text()
  
    // If it's JSON, try to pull a message out
    if (rawBody.trim() && contentType.includes('json')) {
      try {
        const errorData = JSON.parse(rawBody) as { detail?: string; message?: string }
        throw new Error(errorData.detail || errorData.message || fallbackMessage)
      } catch {
        // body existed but wasn't valid JSON
        throw new Error(fallbackMessage)
      }
    }
  
    // If it's not JSON but has some text, return it as the message
    if (rawBody.trim() && !contentType.includes('json')) {
      throw new Error(rawBody)
    }
  
    // Empty body
    throw new Error(fallbackMessage)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
