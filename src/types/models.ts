export type Role = 'admin' | 'regular'
export type Status = 'Available' | 'Assigned' | 'Maintenance'
export type Category = 'Laptop' | 'Desktop Computer' | 'Printer' | 'Mobile Phone' | 'Monitor' | 'Keyboard' | 'Mouse'
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved'
export type BackendTicketStatus = TicketStatus | 'Closed'
export type Priority = 'Low' | 'Medium' | 'High'

export type AppUser = {
  id: number
  username: string
  email: string
  role: Role
}

export type Asset = {
  id: number
  asset_tag: string
  name: string
  category: string
  purchase_date: string
  status: Status
  assigned_user_id: number | null
}

export type Ticket = {
  id: number
  asset_id: number
  priority: Priority
  status: TicketStatus
  description: string
  created_by: number
  created_at: string
}

export type Flash = {
  kind: 'success' | 'error' | 'info'
  text: string
}
