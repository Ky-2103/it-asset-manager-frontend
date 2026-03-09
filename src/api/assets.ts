import type { Asset } from '../types/models.js'
import { apiRequest } from './http.js'

export type CreateAssetPayload = {
  asset_tag: string
  name: string
  category: string
  status: Asset['status']
  assigned_user_id: number | null
}

export type UpdateAssetPayload = Partial<CreateAssetPayload>

export function listAssets() {
  return apiRequest<Asset[]>('assets')
}

export function listMyAssets() {
  return apiRequest<Asset[]>('assets/my')
}

export function createAsset(payload: CreateAssetPayload) {
  return apiRequest<Asset>('assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAsset(assetId: number, payload: UpdateAssetPayload) {
  return apiRequest<Asset>(`assets/${assetId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function removeAsset(assetId: number) {
  return apiRequest<void>(`assets/${assetId}`, {
    method: 'DELETE',
  })
}
