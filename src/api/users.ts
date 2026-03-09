import type { AppUser } from '../types/models.js'
import { apiRequest } from './http.js'

export function listUsers() {
  return apiRequest<AppUser[]>('users')
}
