import test from 'node:test'
import assert from 'node:assert/strict'
import { createAssetAction, parseCreateAssetFormData, validateCreateAssetPayload } from '../src/features/assets/actions.js'
import { createTicketAction, parseCreateTicketFormData, validateCreateTicketPayload } from '../src/features/tickets/actions.js'
import { getActionErrorMessage } from '../src/features/shared/errors.js'

test('parseCreateAssetFormData trims values and normalizes assigned user', () => {
  const formData = new FormData()
  formData.set('asset_tag', '  AST-100  ')
  formData.set('name', '  Laptop  ')
  formData.set('category', '  Hardware  ')
  formData.set('status', 'Assigned')
  formData.set('assigned_user_id', ' 42 ')

  assert.deepEqual(parseCreateAssetFormData(formData), {
    asset_tag: 'AST-100',
    name: 'Laptop',
    category: 'Hardware',
    status: 'Assigned',
    assigned_user_id: 42,
  })
})

test('validateCreateAssetPayload enforces required fields and assigned-user rule', () => {
  assert.throws(() =>
    validateCreateAssetPayload({ asset_tag: '', name: 'A', category: 'B', status: 'Available', assigned_user_id: null }),
  )

  assert.throws(() =>
    validateCreateAssetPayload({ asset_tag: 'A', name: 'B', category: 'C', status: 'Assigned', assigned_user_id: null }),
  )

  assert.doesNotThrow(() =>
    validateCreateAssetPayload({ asset_tag: 'A', name: 'B', category: 'C', status: 'Assigned', assigned_user_id: 9 }),
  )
})

test('createAssetAction validates payload before create call', async () => {
  const invalid = new FormData()
  invalid.set('name', 'Laptop')

  let called = false
  await assert.rejects(() => createAssetAction(invalid, async () => {
    called = true
  }))
  assert.equal(called, false)
})

test('parse/validate ticket payload and action', async () => {
  const formData = new FormData()
  formData.set('description', '  Needs repair ')
  formData.set('asset_id', '15')
  formData.set('priority', 'High')

  assert.deepEqual(parseCreateTicketFormData(formData), {
    description: 'Needs repair',
    asset_id: 15,
    priority: 'High',
  })

  assert.throws(() => validateCreateTicketPayload({ description: '', asset_id: 0, priority: 'Low' }))

  let captured: unknown
  await createTicketAction(formData, async (payload) => {
    captured = payload
  })
  assert.deepEqual(captured, {
    description: 'Needs repair',
    asset_id: 15,
    priority: 'High',
  })
})

test('getActionErrorMessage returns error message or fallback', () => {
  assert.equal(getActionErrorMessage(new Error(' Boom '), 'Fallback'), ' Boom ')
  assert.equal(getActionErrorMessage(new Error('   '), 'Fallback'), 'Fallback')
  assert.equal(getActionErrorMessage('oops', 'Fallback'), 'Fallback')
})
