import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApiClient } from '../hooks/useApiClient'

type GetUserResponse = {
  code: string
  status: string
  message: string
  data: {
    _id: string
    screenName?: string
    [key: string]: any
  }
}

/**
 * DashboardProtectedRoute - Protects dashboard routes
 * 
 * Checks if user has completed registration (screenName === 'dashboard')
 * If not, redirects to the appropriate registration step
 */
export const DashboardProtectedRoute = () => {
  const api = useApiClient()
  const location = useLocation()
  const [status, setStatus] = useState<'checking' | 'allowed' | 'redirect'>('checking')
  const [redirectTo, setRedirectTo] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    const checkRegistrationStatus = async () => {
      try {
        const response = await api.get<GetUserResponse>('auth/getUser')
        
        if (cancelled) return

        if (response.status === 'success' && response.data) {
          const screenName = response.data.screenName?.toLowerCase() || ''
          
          // Route map for registration steps
          const routeMap: Record<string, string> = {
            personaldetails: '/dashboard/personaldetails',
            careerdetails: '/dashboard/careerdetails',
            socialdetails: '/dashboard/socialdetails',
            srcmdetails: '/dashboard/srcmdetails',
            familydetails: '/dashboard/familydetails',
            partnerpreferences: '/dashboard/partnerpreferences',
            aboutyou: '/dashboard/aboutyou',
            underverification: '/under-verification',
            dashboard: '/dashboard', // Registration complete
          }

          // If screenName is 'dashboard', user has completed registration
          if (screenName === 'dashboard') {
            setStatus('allowed')
            return
          }

          // If screenName is something else, redirect to that step
          if (screenName && routeMap[screenName]) {
            // Don't redirect if already on the correct page
            if (location.pathname === routeMap[screenName]) {
              setStatus('allowed')
              return
            }
            
            setRedirectTo(routeMap[screenName])
            setStatus('redirect')
            return
          }

          // If no screenName or unknown screenName, redirect to first step
          setRedirectTo('/dashboard/personaldetails')
          setStatus('redirect')
        } else {
          // If API fails, redirect to first step
          setRedirectTo('/dashboard/personaldetails')
          setStatus('redirect')
        }
      } catch (error) {
        if (cancelled) return
        console.error('Error checking registration status:', error)
        // On error, redirect to first step
        setRedirectTo('/dashboard/personaldetails')
        setStatus('redirect')
      }
    }

    checkRegistrationStatus()

    return () => {
      cancelled = true
    }
  }, [api, location.pathname])

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent" />
          <p className="text-sm">Checking registration status...</p>
        </div>
      </div>
    )
  }

  if (status === 'redirect' && redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
