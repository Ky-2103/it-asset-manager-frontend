import { useCallback, useMemo, useState } from 'react'
import { createTicket as createTicketRequest, updateTicket as updateTicketRequest } from '../api/tickets'
import type { AppUser, Ticket, TicketStatus } from '../types/models'

export function useTickets(currentUser: AppUser | null) {
  const [tickets, setTickets] = useState<Ticket[]>([])

  const myTickets = useMemo(
    () => tickets.filter((ticket) => currentUser && ticket.created_by === currentUser.id),
    [tickets, currentUser],
  )

  const replaceTicketsData = useCallback((nextTickets: Ticket[]) => {
    setTickets(nextTickets)
  }, [])

  const createTicket = useCallback(async (payload: { description: string; asset_id: number; priority: Ticket['priority'] }) => {
    const newTicket = await createTicketRequest(payload)
    setTickets((previous) => [newTicket, ...previous])
    return newTicket
  }, [])

  const updateTicketStatus = useCallback(async (ticketId: number, status: TicketStatus) => {
    const updatedTicket = await updateTicketRequest(ticketId, { status })
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              ...updatedTicket,
            }
          : ticket,
      ),
    )
    return updatedTicket
  }, [])

  const clearTicketState = useCallback(() => {
    setTickets([])
  }, [])

  return { tickets, myTickets, replaceTicketsData, createTicket, updateTicketStatus, clearTicketState }
}
