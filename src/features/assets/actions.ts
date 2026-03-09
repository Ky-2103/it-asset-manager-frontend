import type { CreateAssetPayload } from '../../api/assets.js'

export function parseCreateAssetFormData(formData: FormData): CreateAssetPayload {
  const assignedUserIdRaw = String(formData.get('assigned_user_id') ?? '').trim()

  return {
    asset_tag: String(formData.get('asset_tag') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    status: String(formData.get('status') ?? 'Available') as CreateAssetPayload['status'],
    assigned_user_id: assignedUserIdRaw ? Number(assignedUserIdRaw) : null,
  }
}

export function validateCreateAssetPayload(payload: CreateAssetPayload) {
  if (!payload.asset_tag || !payload.name || !payload.category) {
    throw new Error('Asset tag, name, category are required.')
  }

  if (payload.status === 'Assigned' && !payload.assigned_user_id) {
    throw new Error('Please select an assigned user when status is Assigned.')
  }
}

export async function createAssetAction(formData: FormData, createAsset: (payload: CreateAssetPayload) => Promise<unknown>) {
  const payload = parseCreateAssetFormData(formData)
  validateCreateAssetPayload(payload)
  await createAsset(payload)
}
