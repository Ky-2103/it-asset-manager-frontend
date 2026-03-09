import { useCallback, useState } from 'react'
import { createAsset as createAssetRequest, removeAsset, updateAsset } from '../api/assets'
import type { Asset } from '../types/models'

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [myAssets, setMyAssets] = useState<Asset[]>([])

  const replaceAssetsData = useCallback((nextAssets: Asset[], nextMyAssets: Asset[]) => {
    setAssets(nextAssets)
    setMyAssets(nextMyAssets)
  }, [])

  const createAsset = useCallback(
    async (payload: {
      asset_tag: string
      name: string
      category: Asset['category']
      status: Asset['status']
      assigned_user_id: number | null
    }) => {
      const newAsset = await createAssetRequest(payload)
      setAssets((previous) => [newAsset, ...previous])
      return newAsset
    },
    [],
  )

  const applyAssetUpdate = useCallback(async (assetId: number, payload: { status: Asset['status']; assigned_user_id: number | null }) => {
    const updatedAsset = await updateAsset(assetId, payload)

    setAssets((previous) => previous.map((asset) => (asset.id === assetId ? updatedAsset : asset)))
    setMyAssets((previous) => previous.map((asset) => (asset.id === assetId ? updatedAsset : asset)))

    return updatedAsset
  }, [])

  const deleteAsset = useCallback(async (assetId: number) => {
    await removeAsset(assetId)
    setAssets((previous) => previous.filter((asset) => asset.id !== assetId))
    setMyAssets((previous) => previous.filter((asset) => asset.id !== assetId))
  }, [])

  const clearAssetState = useCallback(() => {
    setAssets([])
    setMyAssets([])
  }, [])

  return { assets, myAssets, replaceAssetsData, createAsset, updateAsset: applyAssetUpdate, deleteAsset, clearAssetState }
}
