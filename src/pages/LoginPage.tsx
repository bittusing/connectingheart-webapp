import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { AuthCard } from '../components/forms/AuthCard'
import { TextInput } from '../components/forms/TextInput'
import { useApiClient } from '../hooks/useApiClient'
import type { AuthResponse } from '../types/auth'

export const LoginPage = () => {
  const api = useApiClient()
  const navigate = useNavigate()
  const [phoneNumber, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setMessage(null)
    try {
      // Add /api/ prefix if not already present
      const loginPath = `auth/login`
      const response = await api.post<{ phoneNumber: string; password: string }, AuthResponse>(
        loginPath,
        { phoneNumber, password },
      )

      // Store token in localStorage
      if (response.token) {
        window.localStorage.setItem('connectingheart-token', response.token)
        // Optionally store user ID
        if (response.id) {
          window.localStorage.setItem('connectingheart-user-id', response.id)
        }
      }

      setStatus('success')
      setMessage(response.message || 'Redirecting you to your dashboard...')

      // Navigate based on screenName or default to dashboard
      const redirectPath = response.screenName === 'dashboard' ? '/dashboard' : '/dashboard'
      setTimeout(() => {
        navigate(redirectPath, { replace: true })
      }, 1000)
    } catch (error) {
      setStatus('error')
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.'
      setMessage(errorMessage)
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
            <TextInput
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" size="lg" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </Button>
            {message && (
              <p
                className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-emerald-500'}`}
              >
                {message}
              </p>
            )}
          </form>
        </AuthCard>
      </div>
    </section>
  )
}