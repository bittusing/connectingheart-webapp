import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/common/Button'
import { AuthCard } from '../components/forms/AuthCard'
import { TextInput } from '../components/forms/TextInput'
import { Toast } from '../components/common/Toast'
import { useApiClient } from '../hooks/useApiClient'
import type { AuthResponse } from '../types/auth'

const screenNameRoutes: Record<string, string> = {
  dashboard: '/dashboard',
  personaldetails: '/dashboard/personaldetails',
  careerdetails: '/dashboard/careerdetails',
  socialdetails: '/dashboard/socialdetails',
  srcmdetails: '/dashboard/srcmdetails',
  familydetails: '/dashboard/familydetails',
  partnerpreferences: '/dashboard/partnerpreferences',
  partnerpreference: '/dashboard/partnerpreference',
  partnerpreferenceedit: '/dashboard/partnerpreference',
  aboutyou: '/dashboard/aboutyou',
  notification: '/dashboard/notification',
  search: '/dashboard/search',
  searchresults: '/dashboard/search/results',
  profiles: '/dashboard/profiles',
  recommendations: '/dashboard/recommendations',
  visitors: '/dashboard/visitors',
  justjoined: '/dashboard/justjoined',
  interestreceived: '/dashboard/interestreceived',
  interestsent: '/dashboard/interestsent',
  unlockedprofiles: '/dashboard/unlockedprofiles',
  ideclined: '/dashboard/ideclined',
  theydeclined: '/dashboard/theydeclined',
  shortlist: '/dashboard/shortlist',
  ignored: '/dashboard/ignored',
  blocked: '/dashboard/blocked',
  myprofile: '/dashboard/myprofile',
  membership: '/dashboard/membership',
  security: '/dashboard/security',
  delete: '/dashboard/delete',
  feedback: '/dashboard/feedback',
  help: '/dashboard/help',
  terms: '/dashboard/terms',
  privacy: '/dashboard/privacy',
}

type ToastMessage = {
  id: string
  message: string
  variant: 'success' | 'error'
}

export const LoginPage = () => {
  const api = useApiClient()
  const navigate = useNavigate()
  const [phoneNumber, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (message: string, variant: 'success' | 'error') => {
    const id = globalThis.crypto?.randomUUID() ?? `${Date.now()}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const errorMessage = error.message
      
      // Parse API error messages
      if (errorMessage.includes('password') || errorMessage.toLowerCase().includes('incorrect password')) {
        return 'Incorrect password. Please try again.'
      }
      if (errorMessage.includes('phone') || errorMessage.includes('mobile') || errorMessage.includes('number')) {
        return 'Invalid mobile number. Please check and try again.'
      }
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        return 'Mobile number not found. Please check and try again.'
      }
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return 'Invalid credentials. Please check your mobile number and password.'
      }
      
      // Remove "API " prefix if present
      return errorMessage.replace(/^API \d+:?\s*/, '').trim() || 'Login failed. Please try again.'
    }
    return 'Login failed. Please try again.'
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    
    try {
      const loginPath = `auth/login`
      const response = await api.post<{ phoneNumber: string; password: string }, AuthResponse>(
        loginPath,
        { phoneNumber, password },
      )

      // Store token in localStorage
      if (response.token) {
        window.localStorage.setItem('connectingheart-token', response.token)
        if (response.id) {
          window.localStorage.setItem('connectingheart-user-id', response.id)
        }
      }

      setStatus('success')
      const successMessage = response.message || 'Login successful! Redirecting to dashboard...'
      showToast(successMessage, 'success')

      // Navigate based on screenName or default to dashboard
      const normalizedScreen = response.screenName?.toLowerCase().replace(/\s+/g, '') ?? ''
      const redirectPath =
        screenNameRoutes[normalizedScreen] || (normalizedScreen ? `/dashboard/${normalizedScreen}` : '/dashboard')

      setTimeout(() => {
        navigate(redirectPath, { replace: true })
      }, 1000)
    } catch (error) {
      setStatus('error')
      const errorMessage = getErrorMessage(error)
      showToast(errorMessage, 'error')
    }
  }

  return (
    <section className="section-shell">
      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className="hidden rounded-3xl bg-cover bg-center lg:block"
          style={{ backgroundImage: "url('/homeScreenPic.png')" }}
        />
        <AuthCard
          title="Log in to your dashboard"
          subtitle="Continue where you left off. APIs will plug into this form once backend routes go live."
          footer={
            <>
              New here?{' '}
              <Link to="/register" className="font-semibold text-brand-500">
                Create an account
              </Link>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextInput
              label="Mobile number"
              type="number"
              required
              placeholder="+91 90000 00000"
              value={phoneNumber}
              onChange={(event) => setMobile(event.target.value)}
            />
            <div className="relative">
            <TextInput
              label="Password"
                type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <Button type="submit" size="lg" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </AuthCard>
      </div>
      
      {/* Toast Notifications */}
      <div className="pointer-events-none fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={() => dismissToast(toast.id)}
            duration={toast.variant === 'error' ? 4000 : 2000}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </section>
  )
}