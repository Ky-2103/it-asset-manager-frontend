import type { AppUser } from '../types/models'
import { useTableSort } from '../hooks/useTableSort'

type Props = {
  users: AppUser[]
}


export function UsersPage({ users }: Props) {
  type UserSortField = 'id' | 'username' | 'email' | 'role'
  const { sortedRows: sortedUsers, handleSort, getSortArrow } = useTableSort<AppUser, UserSortField>({
    rows: users,
    initialField: 'id',
    accessors: {
      id: (user) => user.id,
      username: (user) => user.username,
      email: (user) => user.email,
      role: (user) => user.role,
    },
  })

  return (
    <section className="panel">
      <h2>Users</h2>
      <p className="muted">Manage system users and their role access.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><button className="table-sort-button" type="button" onClick={() => handleSort('id')}>ID {getSortArrow('id')}</button></th>
              <th><button className="table-sort-button" type="button" onClick={() => handleSort('username')}>Username {getSortArrow('username')}</button></th>
              <th><button className="table-sort-button" type="button" onClick={() => handleSort('email')}>Email {getSortArrow('email')}</button></th>
              <th><button className="table-sort-button" type="button" onClick={() => handleSort('role')}>Role {getSortArrow('role')}</button></th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'ticket-in-progress' : 'available'}`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
