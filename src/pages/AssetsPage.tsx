import { useState } from 'react'
import type { AppUser, Asset } from '../types/models'
import { Trash2 } from 'lucide-react'
import { createAssetAction } from '../features/assets/actions'
import { getActionErrorMessage } from '../features/shared/errors'
import { useTableSort } from '../hooks/useTableSort'

type Props = {
  currentUser: AppUser
  users: AppUser[]
  assets: Asset[]
  myAssets: Asset[]
  onAddAsset: (payload: {
    asset_tag: string
    name: string
    category: string
    status: Asset['status']
    assigned_user_id: number | null
  }) => Promise<unknown>
  onDeleteAsset: (assetId: number) => void
  onUpdateAsset: (assetId: number, payload: { status: Asset['status']; assigned_user_id: number | null }) => void
  showFlash: (kind: 'success' | 'error' | 'info', message: string) => void
}

export function AssetsPage({
  currentUser,
  users,
  assets,
  myAssets,
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset,
  showFlash,
}: Props) {
  type AssetSortField = 'id' | 'asset_tag' | 'name' | 'category' | 'status' | 'assigned_to'

  const rows = currentUser.role === 'admin' ? assets : myAssets
  const [drafts, setDrafts] = useState<Record<number, { status: Asset['status']; assigned_user_id: number | null }>>({})

  const usernameById = new Map(users.map((user) => [user.id, user.username]))

  function getDraft(asset: Asset) {
    return drafts[asset.id] ?? { status: asset.status, assigned_user_id: asset.assigned_user_id }
  }

  const changedDraftEntries = Object.entries(drafts).filter(([id, draft]) => {
    const asset = assets.find((a) => a.id === Number(id))
    if (!asset) return false

    return draft.status !== asset.status || draft.assigned_user_id !== asset.assigned_user_id
  })

  const changedAssets = changedDraftEntries
    .map(([id, draft]) => {
      const asset = assets.find((a) => a.id === Number(id))
      if (!asset) return null

      return {
        asset,
        draft,
        statusChanged: asset.status !== draft.status,
        assignmentChanged: asset.assigned_user_id !== draft.assigned_user_id,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  
  const changedCount = changedDraftEntries.length

  function getAssigneeLabel(assignedUserId: number | null) {
    return assignedUserId ? usernameById.get(assignedUserId) ?? 'Unknown user' : 'Unassigned'
  }

  function discardAssetChanges(assetId: number) {
    setDrafts((previous) => {
      const copy = { ...previous }
      delete copy[assetId]
      return copy
    })
  }

  function discardAllChanges() {
    if (changedCount === 0) return

    const confirmed = window.confirm(
      `Discard all unsaved changes for ${changedCount} asset${changedCount > 1 ? 's' : ''}?`
    )

    if (!confirmed) return

    setDrafts({})
  }

  const { sortedRows, handleSort, getSortArrow } = useTableSort<Asset, AssetSortField>({
    rows,
    initialField: 'id',
    accessors: {
      id: (asset) => asset.id,
      asset_tag: (asset) => asset.asset_tag,
      name: (asset) => asset.name,
      category: (asset) => asset.category,
      status: (asset) => asset.status,
      assigned_to: (asset) => getAssigneeLabel(asset.assigned_user_id),
    },
  })


  const handleAddAsset: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const form = event.currentTarget

    try {
      await createAssetAction(new FormData(form), onAddAsset)
      showFlash('success', 'Asset added successfully.')
      form.reset()
    } catch (error) {
      showFlash('error', getActionErrorMessage(error, 'Unable to add asset.'))
    }
  }

  async function handleBulkUpdate() {
    if (changedCount === 0) return
  
    const confirmed = window.confirm(
      `Confirm you would like to update ${changedCount} asset${
        changedCount > 1 ? "s" : ""
      }?`
    )
  
    if (!confirmed) return
  
    try {
      await Promise.all(
        changedDraftEntries.map(([id, draft]) =>
          onUpdateAsset(Number(id), draft)
        )
      )
  
      // Clear only updated drafts
      setDrafts((previous) => {
        const copy = { ...previous }
        changedDraftEntries.forEach(([id]) => {
          delete copy[Number(id)]
        })
        return copy
      })
    } catch (error) {
      console.error("Bulk update failed:", error)
      // Keep drafts so user can retry
    }
  }

  return (
    <section className="stack">
      <div className="panel split">
        <div>
          <h2>Assets</h2>
          <p className="muted">Manage assets.</p>
        </div>
        {currentUser.role === 'admin' && (
          
          <form className="inline-form" onSubmit={handleAddAsset}>
            <input name="asset_tag" placeholder="Asset tag" required />
            <input name="name" placeholder="Asset name" required />
            <select name="category" defaultValue="">
              <option value="" disabled>
                Category
              </option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop Computer">Desktop computer</option>
              <option value="Printer">Printer</option>
              <option value="Mobile">Mobile phone</option>
              <option value="Monitor">Monitor</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
            </select>
            <select name="status" defaultValue="">
              <option value="" disabled>
                Status
              </option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <select name="assigned_user_id" defaultValue="">
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <button type="submit">Add Asset</button>
          </form>
        )}
      </div>

      <div className="panel">
        {currentUser.role === 'admin' && changedCount > 0 && (
          <div className="asset-pending-updates">
            <div className="asset-pending-header">
              <div>
                <h3>Pending updates ({changedCount})</h3>
                <p>Review what will change before saving.</p>
              </div>
              <div className="actions-row">
                <button className="secondary" onClick={discardAllChanges} type="button">
                  Discard all
                </button>
                <button onClick={handleBulkUpdate} type="button">
                  Update selected
                </button>
              </div>
            </div>
            <ul>
              {changedAssets.map(({ asset, draft, statusChanged, assignmentChanged }) => (
                <li key={asset.id}>
                  <div>
                    <strong>
                      {asset.asset_tag} — {asset.name}
                    </strong>
                    {statusChanged && (
                      <div>
                        Status: <span>{asset.status}</span> → <span>{draft.status}</span>
                      </div>
                    )}
                    {assignmentChanged && (
                      <div>
                        Assigned: <span>{getAssigneeLabel(asset.assigned_user_id)}</span> →{' '}
                        <span>{getAssigneeLabel(draft.assigned_user_id)}</span>
                      </div>
                    )}
                  </div>
                  <button className="link" onClick={() => discardAssetChanges(asset.id)} type="button">
                    Discard
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

<div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('id')}>ID {getSortArrow('id')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('asset_tag')}>Asset Tag {getSortArrow('asset_tag')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('name')}>Name {getSortArrow('name')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('category')}>Category {getSortArrow('category')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('status')}>Status {getSortArrow('status')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('assigned_to')}>Assigned To {getSortArrow('assigned_to')}</button></th>
                {currentUser.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((asset) => {
              const draft = getDraft(asset)
              const hasChanges =
              draft.status !== asset.status ||
              draft.assigned_user_id !== asset.assigned_user_id

              const rowClassName = currentUser.role === 'admin' ? `asset-row asset-row-${asset.status.toLowerCase()}` : undefined
              
              return (
                <tr key={asset.id} className={rowClassName}>
                  <td>{asset.id}</td>
                  <td>{asset.asset_tag}</td>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>
                    {currentUser.role === 'admin' ? (
                      <select
                        value={draft.status}
                        onChange={(event) => {
                          const nextStatus = event.target.value as Asset['status']
                          setDrafts((previous) => ({
                            ...previous,
                            [asset.id]: {
                              ...draft,
                              status: nextStatus,
                              assigned_user_id: nextStatus === 'Assigned' ? draft.assigned_user_id : null,
                            },
                          }))
                        }}
                      >
                        <option>Available</option>
                        <option>Assigned</option>
                        <option>Maintenance</option>
                      </select>
                    ) : (
                      <span className={`badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
                    )}
                  </td>
                  <td>
                    {currentUser.role === 'admin' ? (
                      <select
                        value={draft.assigned_user_id ?? ''}
                        onChange={(event) => {
                          const value = event.target.value
                          setDrafts((previous) => ({
                            ...previous,
                            [asset.id]: {
                              ...draft,
                              assigned_user_id: value ? Number(value) : null,
                            },
                          }))
                        }}
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getAssigneeLabel(asset.assigned_user_id)
                    )}
                  </td>
                  {currentUser.role === 'admin' && (
                  <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px", // spacing between buttons
                    }}
                  >   
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      aria-label="Delete asset"
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <Trash2 size={20} color="#374151" />
                    </button>
                    {hasChanges && (
                      <button className="secondary" onClick={() => discardAssetChanges(asset.id)} type="button">
                        Discard changes
                      </button>
                    )}


                  </div>
                </td>
                
                  )}
                </tr>
              )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="empty">No assets found.</p>}
      </div>
    </section>
  )
}
