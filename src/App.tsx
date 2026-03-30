import { useCallback, useEffect, useMemo } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { FlashMessage } from './components/FlashMessage'
import { TopNav } from './components/TopNav'
import { useAssets } from './hooks/useAssets'
import { useAppHandlers } from './hooks/useAppHandlers'
import { useBootstrapData } from './hooks/useBootstrapData'
import { useAuthSession } from './hooks/useAuthSession'
import { useFlash } from './hooks/useFlash'
import { useTickets } from './hooks/useTickets'
import ProtectedLayout from './layouts/ProtectedLayout'
import { AssetsPage } from './pages/AssetsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TicketsPage } from './pages/TicketsPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const route = location.pathname

  const { currentUser, isAuthenticated, hasAuthenticatedUser, login, register, logout } = useAuthSession()
  const { flash, showFlash, clearFlash } = useFlash()
  const {
    assets,
    myAssets,
    replaceAssetsData,
    createAsset,
    updateAsset,
    deleteAsset: removeAsset,
    clearAssetState,
  } = useAssets()
  const { tickets, myTickets, replaceTicketsData, createTicket, updateTicketStatus, clearTicketState } = useTickets(currentUser)

  const isHydratingSession = false

  const { users, assets: bootstrappedAssets, myAssets: bootstrappedMyAssets, tickets: bootstrappedTickets, error: bootstrapError } =
    useBootstrapData(currentUser, isAuthenticated)

  const adminStats = useMemo(() => {
    const totalAssets = assets.length
    const assignedAssets = assets.filter((asset) => asset.status === 'Assigned').length
    const inMaintenance = assets.filter((asset) => asset.status === 'Maintenance').length
    const openTickets = tickets.filter((ticket) => ticket.status !== 'Resolved').length
    const totalUsers = users.length

    return { totalAssets, assignedAssets, inMaintenance, openTickets, totalUsers }
  }, [assets, tickets, users])

  const clearProtectedState = useCallback(() => {
    clearAssetState()
    clearTicketState()
  }, [clearAssetState, clearTicketState])

  const {
    appNavigate,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateTicketStatus,
    handleUpdateAsset,
    handleDeleteAsset,
  } = useAppHandlers({
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
  })

  useEffect(() => {
    replaceAssetsData(bootstrappedAssets, bootstrappedMyAssets)
  }, [bootstrappedAssets, bootstrappedMyAssets, replaceAssetsData])

  useEffect(() => {
    replaceTicketsData(bootstrappedTickets)
  }, [bootstrappedTickets, replaceTicketsData])

  useEffect(() => {
    if (bootstrapError) {
      showFlash('error', bootstrapError)
    }
  }, [bootstrapError, showFlash])

  useEffect(() => {
    if (!currentUser || !isAuthenticated) return

    // Keep authenticated users away from public auth routes.
    if (route === '/' || route === '/login' || route === '/register') {
      navigate('/dashboard', { replace: true })
    }
  }, [currentUser, isAuthenticated, navigate, route])

  return (
    <div className="app-shell">
      {!isHydratingSession && isAuthenticated && currentUser && (
        <TopNav currentUser={currentUser} navigate={appNavigate} onLogout={handleLogout} />
      )}

      <main className="page">
        <FlashMessage flash={flash} />

        <Routes>
          <Route path="/" element={<LandingPage navigate={appNavigate} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} navigate={appNavigate} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleRegister} navigate={appNavigate} />} />

          <Route element={<ProtectedLayout isAuthenticated={hasAuthenticatedUser()} isHydratingSession={isHydratingSession} />}>
            <Route
              path="/dashboard"
              element={
                currentUser ? (
                  <DashboardPage
                    currentUser={currentUser}
                    adminStats={adminStats}
                    myAssetsCount={myAssets.length}
                    myTickets={myTickets}
                    navigate={appNavigate}
                  />
                ) : null
              }
            />

            <Route
              path="/assets"
              element={
                currentUser ? (
                  <AssetsPage
                    currentUser={currentUser}
                    users={users}
                    assets={assets}
                    myAssets={myAssets}
                    onAddAsset={createAsset}
                    showFlash={showFlash}
                    onUpdateAsset={handleUpdateAsset}
                    onDeleteAsset={handleDeleteAsset}
                  />
                ) : null
              }
            />

            <Route
              path="/tickets"
              element={
                currentUser ? (
                  <TicketsPage
                    currentUser={currentUser}
                    assets={currentUser.role === 'admin' ? assets : myAssets}
                    tickets={tickets}
                    myTickets={myTickets}
                    onCreateTicket={createTicket}
                    showFlash={showFlash}
                    onUpdateTicketStatus={handleUpdateTicketStatus}
                  />
                ) : null
              }
            />
          </Route>

          <Route path="/users" element={<UsersPage users={users} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
