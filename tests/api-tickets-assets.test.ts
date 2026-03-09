import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createTicket, listMyTickets, updateTicket } from '../src/api/tickets.js'
import { createAsset, removeAsset, updateAsset } from '../src/api/assets.js'
import { MemoryStorage, setFetchMock } from './helpers.js'

const storage = new MemoryStorage()

beforeEach(() => {
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = storage as unknown as Storage
  storage.clear()
})

test('ticket APIs map Closed <-> Resolved status', async () => {
  setFetchMock(async (input, init) => {
    const url = String(input)
    if (url.endsWith('/tickets/my')) {
      return new Response(JSON.stringify([{ id: 1, asset_id: 2, description: 'd', priority: 'High', status: 'Closed', created_by: 1, created_at: '' }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    if (url.endsWith('/tickets/1') && init?.method === 'PUT') {
      assert.equal(init.body, JSON.stringify({ status: 'Closed' }))
      return new Response(JSON.stringify({ id: 1, asset_id: 2, description: 'd', priority: 'High', status: 'Closed', created_by: 1, created_at: '' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ id: 9, asset_id: 2, description: 'x', priority: 'Low', status: 'Open', created_by: 1, created_at: '' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  })

  const mine = await listMyTickets()
  assert.equal(mine[0]?.status, 'Resolved')

  const updated = await updateTicket(1, { status: 'Resolved' })
  assert.equal(updated.status, 'Resolved')

  const created = await createTicket({ asset_id: 2, description: 'x', priority: 'Low' })
  assert.equal(created.status, 'Open')
})

test('asset APIs pass payload through and support delete call', async () => {
  setFetchMock(async (_input, init) => {
    if (init?.method === 'POST') {
      assert.equal(init.body, JSON.stringify({ asset_tag: 'A1', name: 'Laptop', category: 'Hardware', status: 'Available', assigned_user_id: null }))
      return new Response(JSON.stringify({ id: 1, asset_tag: 'A1', name: 'Laptop', category: 'Hardware', status: 'Available', assigned_user_id: null }), { status: 200, headers: { 'content-type': 'application/json' } })
    }

    if (init?.method === 'PUT') {
      assert.equal(init.body, JSON.stringify({ status: 'Assigned', assigned_user_id: 3 }))
      return new Response(JSON.stringify({ id: 1, asset_tag: 'A1', name: 'Laptop', category: 'Hardware', status: 'Assigned', assigned_user_id: 3 }), { status: 200, headers: { 'content-type': 'application/json' } })
    }

    return new Response(null, { status: 204 })
  })

  const created = await createAsset({ asset_tag: 'A1', name: 'Laptop', category: 'Hardware', status: 'Available', assigned_user_id: null })
  assert.equal(created.id, 1)

  const updated = await updateAsset(1, { status: 'Assigned', assigned_user_id: 3 })
  assert.equal(updated.status, 'Assigned')

  await assert.doesNotReject(() => removeAsset(1))
})
