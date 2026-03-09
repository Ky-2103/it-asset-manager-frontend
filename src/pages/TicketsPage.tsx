import type { AppUser, Asset, Ticket, TicketStatus } from '../types/models'
import { createTicketAction } from '../features/tickets/actions'
import { getActionErrorMessage } from '../features/shared/errors'
import { useTableSort } from '../hooks/useTableSort'

type Props = {
  currentUser: AppUser
  assets: Asset[]
  tickets: Ticket[]
  myTickets: Ticket[]
  onCreateTicket: (payload: { description: string; asset_id: number; priority: Ticket['priority'] }) => Promise<unknown>
  onUpdateTicketStatus: (ticketId: number, status: TicketStatus) => void
  showFlash: (kind: 'success' | 'error' | 'info', message: string) => void
}

export function TicketsPage({ currentUser, assets, tickets, myTickets, onCreateTicket, onUpdateTicketStatus, showFlash }: Props) {
  const rows = currentUser.role === 'admin' ? tickets : myTickets
  const assetNameById = new Map(assets.map((asset) => [asset.id, asset.name]))

  type TicketSortField = 'id' | 'description' | 'asset' | 'priority' | 'status' | 'created_by' | 'created_at'
  const { sortedRows, handleSort, getSortArrow } = useTableSort<Ticket, TicketSortField>({
    rows,
    initialField: 'id',
    accessors: {
      id: (ticket) => ticket.id,
      description: (ticket) => ticket.description,
      asset: (ticket) => assetNameById.get(ticket.asset_id) ?? `Asset #${ticket.asset_id}`,
      priority: (ticket) => ticket.priority,
      status: (ticket) => ticket.status,
      created_by: (ticket) => ticket.created_by,
      created_at: (ticket) => new Date(ticket.created_at),
    },
  })

  const handleCreateTicket: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const form = event.currentTarget

    try {
      await createTicketAction(new FormData(form), onCreateTicket)
      showFlash('success', 'Ticket created successfully.')
      form.reset()
    } catch (error) {
      showFlash('error', getActionErrorMessage(error, 'Unable to create ticket.'))
    }
  }

  return (
    <section className="stack">
      <div className="panel ticket-create-panel">
        <div className="ticket-create-heading">
          <h2>{currentUser.role === 'admin' ? 'All Tickets' : 'My Tickets'}</h2>
          <p className="muted">Track ticket status and maintenance priorities.</p>
        </div>
        <form className="ticket-create-form" onSubmit={handleCreateTicket}>
          <div className="ticket-create-form-row">
            <label>
              <span>Asset</span>
              <select name="asset_id" defaultValue="" required disabled={assets.length === 0}>
                <option value="" disabled>
                  Select asset
                </option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Priority</span>
              <select name="priority" defaultValue="Medium" disabled={assets.length === 0}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea
              name="description"
              rows={5}
              placeholder={assets.length === 0 ? 'No assets available for ticket creation' : 'Describe the issue in as much detail as needed.'}
              required
              disabled={assets.length === 0}
            />
          </label>

          <div className="ticket-create-actions">
            <button type="submit" disabled={assets.length === 0}>
              Create Ticket
            </button>
          </div>
        </form>
        {assets.length === 0 && <p className="muted">No assets found. Add/assign an asset before creating a ticket.</p>}
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('id')}>ID {getSortArrow('id')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('description')}>Description {getSortArrow('description')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('asset')}>Asset {getSortArrow('asset')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('priority')}>Priority {getSortArrow('priority')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('status')}>Status {getSortArrow('status')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('created_by')}>Raised By (ID) {getSortArrow('created_by')}</button></th>
                <th><button className="table-sort-button" type="button" onClick={() => handleSort('created_at')}>Date {getSortArrow('created_at')}</button></th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((ticket) => {
              const ticketRowClass = `ticket-row${ticket.status === 'In Progress' ? ' ticket-row-in-progress' : ''}${ticket.status === 'Resolved' ? ' ticket-row-resolved' : ''}`

              return (
              <tr key={ticket.id} className={ticketRowClass}>
                <td>{ticket.id}</td>
                <td>{ticket.description}</td>
                <td>{assetNameById.get(ticket.asset_id) ?? `Asset #${ticket.asset_id}`}</td>
                <td>
                  <span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                </td>
                <td>
                  {currentUser.role === 'admin' ? (
                    <select
                      value={ticket.status}
                      onChange={(event) => onUpdateTicketStatus(ticket.id, event.target.value as TicketStatus)}
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  ) : (
                    <span className={`badge ticket-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span>
                  )}
                </td>
                <td>{ticket.created_by}</td>
                <td>{new Date(ticket.created_at).toLocaleString()}</td>
              </tr>
              )})}
            </tbody>
          </table>
        </div>
        {currentUser.role !== 'admin' && myTickets.length === 0 && <p className="empty">No tickets raised yet.</p>}
      </div>
    </section>
  )
}
