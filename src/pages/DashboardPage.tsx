import { StatCard } from '../components/StatCard'
import type { AppUser, Ticket } from '../types/models'

type AdminStats = {
  totalAssets: number
  assignedAssets: number
  inMaintenance: number
  openTickets: number
  totalUsers: number
}

type Props = {
  currentUser: AppUser
  adminStats: AdminStats
  myAssetsCount: number
  myTickets: Ticket[]
  navigate: (to: string) => void
}

export function DashboardPage({ currentUser, adminStats, myAssetsCount, myTickets, navigate }: Props) {
  const resolvedTickets = myTickets.filter((ticket) => ticket.status === 'Resolved').length
  const openTickets = myTickets.length - resolvedTickets

  return (
    <section className="stack">
      <div className="panel">
        <h2>{currentUser.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h2>
        <p className="muted">
          {currentUser.role === 'admin'
            ? 'Overview of assets, users, and maintenance operations.'
            : 'Quick overview of your assets and maintenance activity.'}
        </p>
      </div>

      {currentUser.role === 'admin' ? (
        <>
          <div className="grid-cards">
            <StatCard label="Total Assets" value={adminStats.totalAssets} />
            <StatCard label="Assigned" value={adminStats.assignedAssets} />
            <StatCard label="Maintenance" value={adminStats.inMaintenance} />
            <StatCard label="Open Tickets" value={adminStats.openTickets} />
            <StatCard label="Users" value={adminStats.totalUsers} />
          </div>
          <div className="panel actions-row">
            <button onClick={() => navigate('/assets')}>Manage Assets</button>
            <button onClick={() => navigate('/users')}>Manage Users</button>
            <button onClick={() => navigate('/tickets')}>Manage Tickets</button>
          </div>
        </>
      ) : (
        <>
          <div className="grid-cards">
            <StatCard label="My Assigned Assets" value={myAssetsCount} />
            <StatCard
              label="My Open Tickets"
              value={openTickets}
            />
            <StatCard
              label="Resolved Tickets"
              value={resolvedTickets}
            />
          </div>
          <div className="panel actions-row">
            <button onClick={() => navigate('/tickets')}>Create New Ticket</button>
            <button className="secondary" onClick={() => navigate('/tickets')}>
              View My Tickets
            </button>
            <button className="secondary" onClick={() => navigate('/assets')}>
              View My Assets
            </button>
          </div>
        </>
      )}
    </section>
  )
}
