import { useCallback } from 'react'
import { getActionErrorMessage } from '../features/shared/errors'
import type { Status, TicketStatus } from '../types/models'

type Navigate = (to: string, options?: { replace?: boolean }) => void

type UseAppHandlersArgs = {
  navigate: Navigate
  clearFlash: () => void
  showFlash: (kind: 'success' | 'error' | 'info', message: string) => void
  login: (credentials: { username: string; password: string }) => Promise<{ username: string }>
  register: (payload: { username: string; email: string; password: string; confirmPassword: string }) => Promise<void>
  logout: () => void
  clearProtectedState: () => void
  updateTicketStatus: (ticketId: number, status: TicketStatus) => Promise<unknown>
  updateAsset: (assetId: number, payload: { status: Status; assigned_user_id: number | null }) => Promise<unknown>
  removeAsset: (assetId: number) => Promise<void>
}

export function useAppHandlers({
  navigate,
  clearFlash,
  showFlash,
  login,
  register,
  logout,
  clearProtectedState,
  updateTicketStatus,
  updateAsset,
  removeAsset,
}: UseAppHandlersArgs) {
  const appNavigate = useCallback<Navigate>(
    (to, options) => {
      navigate(to, { replace: options?.replace })
      clearFlash()
    },
    [clearFlash, navigate],
  )

  const handleLogin = useCallback(
    async (credentials: { username: string; password: string }) => {
      const resolvedUser = await login(credentials)
      appNavigate('/dashboard')
      showFlash('success', `Welcome back, ${resolvedUser.username}.`)
    },
    [appNavigate, login, showFlash],
  )

  const handleRegister = useCallback(
    async (payload: { username: string; email: string; password: string; confirmPassword: string }) => {
      await register(payload)
      showFlash('success', 'Registration complete. You can now log in.')
      appNavigate('/login')
    },
    [appNavigate, register, showFlash],
  )

  const handleLogout = useCallback(() => {
    logout()
    clearProtectedState()
    appNavigate('/login')
    showFlash('success', 'You have been logged out.')
  }, [appNavigate, clearProtectedState, logout, showFlash])

  const handleUpdateTicketStatus = useCallback(
    async (ticketId: number, status: TicketStatus) => {
      try {
        await updateTicketStatus(ticketId, status)
        showFlash('success', 'Ticket status updated.')
      } catch (error) {
        showFlash('error', getActionErrorMessage(error, 'Unable to update ticket.'))
      }
    },
    [showFlash, updateTicketStatus],
  )

  const handleUpdateAsset = useCallback(
    async (assetId: number, payload: { status: Status; assigned_user_id: number | null }) => {
      if (payload.status === 'Assigned' && !payload.assigned_user_id) {
        const message = 'assigned_user_id is required when status is Assigned.'
        showFlash('error', message)
        throw new Error(message)
      }

      try {
        const updatedAsset = await updateAsset(assetId, payload)
        showFlash('success', 'Asset updated.')
        return updatedAsset
      } catch (error) {
        showFlash('error', getActionErrorMessage(error, 'Unable to update asset.'))
        throw error
      }
    },
    [showFlash, updateAsset],
  )

  const handleDeleteAsset = useCallback(
    async (assetId: number) => {
      if (!window.confirm('Delete this asset? This action cannot be undone.')) return

      try {
        await removeAsset(assetId)
        showFlash('success', 'Asset removed.')
      } catch (error) {
        showFlash('error', getActionErrorMessage(error, 'Unable to remove asset.'))
      }
    },
    [removeAsset, showFlash],
  )

  return {
    appNavigate,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateTicketStatus,
    handleUpdateAsset,
    handleDeleteAsset,
  }
}
