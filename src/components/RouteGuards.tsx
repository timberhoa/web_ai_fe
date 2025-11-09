import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import type { Role } from '../services/auth'

export const RequireAuth: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed || !!s.token)
  const location = useLocation()
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export const PublicOnly: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed || !!s.token)
  if (isAuthed) return <Navigate to="/" replace />
  return <Outlet />
}

export const RequireRole: React.FC<{ allow: Role[] }> = ({ allow }) => {
  const user = useAuthStore((s) => s.user)
  console.log('user in RequireRole', user);
  if (!user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}

export default RequireAuth
