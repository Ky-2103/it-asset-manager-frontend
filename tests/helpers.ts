export class MemoryStorage {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

export function makeJwt(payload: Record<string, unknown>) {
  const base64Url = (input: string) => Buffer.from(input).toString('base64url')
  return `${base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${base64Url(JSON.stringify(payload))}.`
}

export function setFetchMock(handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  globalThis.fetch = handler as typeof fetch
}
