import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { apiRequest } from '../src/api/http.js'
import { getUserFromToken } from '../src/api/auth.js'
import { MemoryStorage, makeJwt, setFetchMock } from './helpers.js'

const storage = new MemoryStorage()

beforeEach(() => {
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = storage as unknown as Storage
  storage.clear()
})

test('apiRequest adds auth/content headers and parses json', async () => {
  storage.setItem('token', 'abc123')

  setFetchMock(async (_input, init) => {
    const headers = init?.headers as Headers
    assert.equal(headers.get('Authorization'), 'Bearer abc123')
    assert.equal(headers.get('Content-Type'), 'application/json')
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  })

  const result = await apiRequest<{ ok: boolean }>('assets', { method: 'POST', body: JSON.stringify({ a: 1 }) })
  assert.deepEqual(result, { ok: true })
})

test('apiRequest handles unauthorized and clears session for non-login routes', async () => {
  storage.setItem('token', 'abc123')
  storage.setItem('currentUser', '{"id":1}')

  setFetchMock(async () => new Response('', { status: 401 }))

  await assert.rejects(() => apiRequest('assets'), /UNAUTHORIZED/)
  assert.equal(storage.getItem('token'), null)
  assert.equal(storage.getItem('currentUser'), null)
})

test('apiRequest returns login-specific 401 message', async () => {
  setFetchMock(async () => new Response('', { status: 401 }))
  await assert.rejects(() => apiRequest('login'), /Invalid username or password/)
})

test('apiRequest surfaces non-json body for failed request', async () => {
  setFetchMock(async () => new Response('Broken!', { status: 500, headers: { 'content-type': 'text/plain' } }))
  await assert.rejects(() => apiRequest('assets'), /Broken!/) 
})

test('getUserFromToken decodes valid token and rejects invalid/expired tokens', () => {
  const valid = makeJwt({ sub: '5', username: 'amy', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })
  assert.deepEqual(getUserFromToken(valid), { id: 5, username: 'amy', email: '', role: 'admin' })

  const expired = makeJwt({ sub: '5', username: 'amy', exp: Math.floor(Date.now() / 1000) - 1 })
  assert.equal(getUserFromToken(expired), null)

  const invalid = makeJwt({ sub: 'abc', username: 'amy' })
  assert.equal(getUserFromToken(invalid), null)
})
