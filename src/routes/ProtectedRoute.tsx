import { Navigate, Outlet } from 'react-router-dom'
import type { AuthState } from '../types/auth'

const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { token: null }
  }
  return {
    token: window.localStorage.getItem('connectingheart-token'),
  }
}

export const ProtectedRoute = () => {
  const { token } = getAuthState()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

