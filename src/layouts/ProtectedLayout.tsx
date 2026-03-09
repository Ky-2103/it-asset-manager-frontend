import { Navigate, Outlet } from 'react-router-dom'

type ProtectedLayoutProps = {
  isAuthenticated: boolean
  isHydratingSession?: boolean
}

export default function ProtectedLayout({ isAuthenticated, isHydratingSession = false }: ProtectedLayoutProps) {
  if (isHydratingSession) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
