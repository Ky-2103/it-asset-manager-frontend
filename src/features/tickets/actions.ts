import type { CreateTicketPayload } from '../../api/tickets.js'

export function parseCreateTicketFormData(formData: FormData): CreateTicketPayload {
  return {
    description: String(formData.get('description') ?? '').trim(),
    asset_id: Number(formData.get('asset_id') ?? 0),
    priority: String(formData.get('priority') ?? 'Medium') as CreateTicketPayload['priority'],
  }
}

export function validateCreateTicketPayload(payload: CreateTicketPayload) {
  if (!payload.description || !payload.asset_id) {
    throw new Error('Please add a description and select an asset.')
  }
}

export async function createTicketAction(
  formData: FormData,
  createTicket: (payload: CreateTicketPayload) => Promise<unknown>,
) {
  const payload = parseCreateTicketFormData(formData)
  validateCreateTicketPayload(payload)
  await createTicket(payload)
}
