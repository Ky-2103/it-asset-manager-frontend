import type { BackendTicketStatus, Priority, Ticket, TicketStatus } from '../types/models.js'
import { apiRequest } from './http.js'

type BackendTicket = Omit<Ticket, 'status'> & { status: BackendTicketStatus }

function mapTicketStatusFromBackend(status: BackendTicketStatus): TicketStatus {
  return status === 'Closed' ? 'Resolved' : status
}

function mapTicketStatusToBackend(status: TicketStatus): BackendTicketStatus {
  return status === 'Resolved' ? 'Closed' : status
}

function mapTicketFromBackend(ticket: BackendTicket): Ticket {
  return {
    ...ticket,
    status: mapTicketStatusFromBackend(ticket.status),
  }
}

export type CreateTicketPayload = {
  asset_id: number
  description: string
  priority: Priority
}

export type UpdateTicketPayload = {
  description?: string
  priority?: Priority
  status?: TicketStatus
}

export function listTickets() {
  return apiRequest<BackendTicket[]>('tickets').then((tickets) => tickets.map(mapTicketFromBackend))
}

export function listMyTickets() {
  return apiRequest<BackendTicket[]>('tickets/my').then((tickets) => tickets.map(mapTicketFromBackend))
}

export function createTicket(payload: CreateTicketPayload) {
  return apiRequest<BackendTicket>('tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(mapTicketFromBackend)
}

export function updateTicket(ticketId: number, payload: UpdateTicketPayload) {
  const requestPayload = {
    ...payload,
    ...(payload.status ? { status: mapTicketStatusToBackend(payload.status) } : {}),
  }

  return apiRequest<BackendTicket>(`tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(requestPayload),
  }).then(mapTicketFromBackend)
}

export function removeTicket(ticketId: number) {
  return apiRequest<void>(`tickets/${ticketId}`, {
    method: 'DELETE',
  })
}
