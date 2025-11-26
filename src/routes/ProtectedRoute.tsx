import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { AuthState } from '../types/auth'
import { useApiClient } from '../hooks/useApiClient'

const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { token: null }
  }
  return {
    token: window.localStorage.getItem('connectingheart-token'),
  }
}

type ValidateTokenResponse = {
  code: string
  status: string
  message?: string
}

export const ProtectedRoute = () => {
  const api = useApiClient()
  const [{ token }] = useState<AuthState>(() => getAuthState())
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>(() =>
    token ? 'checking' : 'invalid',
  )

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }

    let cancelled = false

    const validate = async () => {
      try {
        const response = await api.get<ValidateTokenResponse>('auth/validateToken')
        if (cancelled) return

        if (response.status === 'success' || response.code === 'CH200') {
          setStatus('valid')
        } else {
          window.localStorage.removeItem('connectingheart-token')
          window.localStorage.removeItem('connectingheart-user-id')
          setStatus('invalid')
        }
      } catch {
        if (cancelled) return
        window.localStorage.removeItem('connectingheart-token')
        window.localStorage.removeItem('connectingheart-user-id')
        setStatus('invalid')
      }
    }

    validate()

    return () => {
      cancelled = true
    }
  }, [api, token])

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent" />
          <p className="text-sm">Verifying your session...</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

