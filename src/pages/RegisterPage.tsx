import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/common/Button'
import { Alert } from '../components/common/Alert'
import { OtpModal } from '../components/forms/OtpModal'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
import { useRegistration } from '../hooks/useRegistration'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'

// Static country codes list for registration (no token required)
const COUNTRY_CODES = [
  { label: 'India', value: '+91' },
  { label: 'United States', value: '+1' },
  { label: 'United Kingdom', value: '+44' },
  { label: 'Canada', value: '+1' },
  { label: 'Australia', value: '+61' },
  { label: 'Germany', value: '+49' },
  { label: 'France', value: '+33' },
  { label: 'Italy', value: '+39' },
  { label: 'Spain', value: '+34' },
  { label: 'Netherlands', value: '+31' },
  { label: 'Belgium', value: '+32' },
  { label: 'Switzerland', value: '+41' },
  { label: 'Austria', value: '+43' },
  { label: 'Sweden', value: '+46' },
  { label: 'Norway', value: '+47' },
  { label: 'Denmark', value: '+45' },
  { label: 'Finland', value: '+358' },
  { label: 'Poland', value: '+48' },
  { label: 'Portugal', value: '+351' },
  { label: 'Greece', value: '+30' },
  { label: 'Ireland', value: '+353' },
  { label: 'New Zealand', value: '+64' },
  { label: 'Singapore', value: '+65' },
  { label: 'Malaysia', value: '+60' },
  { label: 'UAE', value: '+971' },
  { label: 'Saudi Arabia', value: '+966' },
  { label: 'Qatar', value: '+974' },
  { label: 'Kuwait', value: '+965' },
  { label: 'Bahrain', value: '+973' },
  { label: 'Oman', value: '+968' },
  { label: 'Japan', value: '+81' },
  { label: 'South Korea', value: '+82' },
  { label: 'China', value: '+86' },
  { label: 'Hong Kong', value: '+852' },
  { label: 'Taiwan', value: '+886' },
  { label: 'Thailand', value: '+66' },
  { label: 'Indonesia', value: '+62' },
  { label: 'Philippines', value: '+63' },
  { label: 'Vietnam', value: '+84' },
  { label: 'Bangladesh', value: '+880' },
  { label: 'Pakistan', value: '+92' },
  { label: 'Sri Lanka', value: '+94' },
  { label: 'Nepal', value: '+977' },
  { label: 'Bhutan', value: '+975' },
  { label: 'Maldives', value: '+960' },
  { label: 'Afghanistan', value: '+93' },
  { label: 'Myanmar', value: '+95' },
  { label: 'Cambodia', value: '+855' },
  { label: 'Laos', value: '+856' },
  { label: 'Mongolia', value: '+976' },
  { label: 'Russia', value: '+7' },
  { label: 'Turkey', value: '+90' },
  { label: 'Israel', value: '+972' },
  { label: 'Egypt', value: '+20' },
  { label: 'South Africa', value: '+27' },
  { label: 'Brazil', value: '+55' },
  { label: 'Mexico', value: '+52' },
  { label: 'Argentina', value: '+54' },
  { label: 'Chile', value: '+56' },
  { label: 'Colombia', value: '+57' },
  { label: 'Peru', value: '+51' },
  { label: 'Venezuela', value: '+58' },
]

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

export const RegisterPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { generateOtp, verifyOtp, signup, loading } = useRegistration()

  const [basic, setBasic] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [countryCodeModalOpen, setCountryCodeModalOpen] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleBasicSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!basic.agree) {
      showToast('Please agree to terms and conditions', 'error')
      return
    }

    if (basic.password !== basic.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (!basic.phone || basic.phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid mobile number', 'error')
      return
    }

    if (!basic.countryCode) {
      showToast('Please select a country code', 'error')
      return
    }

    // Extract phone number
    const phoneNumber = basic.phone.replace(/\D/g, '')
    const extension = basic.countryCode

    try {
      setOtpLoading(true)
      const response = await generateOtp(phoneNumber, extension)
      if (response.status === 'success') {
        // Show alert instead of directly opening OTP modal
        const fullPhoneNumber = `${extension}${phoneNumber}`
        setAlertMessage(`OTP has been sent to ${fullPhoneNumber}. Please check your mobile.`)
        setShowAlert(true)
        showToast('OTP sent to your mobile number', 'success')
      } else {
        showToast(response.message || 'Failed to send OTP', 'error')
      }
    } catch (error) {
      // Extract the actual API error message (remove "API 400: " prefix)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP'
      const extractedMessage = errorMessage.replace(/^API \d+:?\s*/, '').trim()
      
      // Use the extracted message if it's meaningful, otherwise use fallback
      const finalMessage = extractedMessage && extractedMessage !== 'Bad Request' && extractedMessage !== 'Unknown error'
        ? extractedMessage
        : 'Failed to send OTP'
      
      showToast(finalMessage, 'error')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleAlertConfirm = () => {
    setShowAlert(false)
    // Open OTP modal after alert is confirmed
    setOtpModalOpen(true)
  }

  const handleOtpVerify = async (otp: string) => {
    const phoneNumber = basic.phone.replace(/\D/g, '')

    try {
      setOtpLoading(true)
      const verifyResponse = await verifyOtp(phoneNumber, otp)

      if (verifyResponse.status === 'success' && verifyResponse.token) {
        showToast('OTP verified successfully', 'success')

        // Automatically call signup API after OTP verification success
        // Token is already stored in localStorage by verifyOtp hook
        try {
          const signupResponse = await signup({
            email: basic.email,
            password: basic.password,
            confirm_password: basic.confirmPassword,
            name: basic.fullName,
            source: 'WEB',
          })

          if (signupResponse.status === 'success' || signupResponse.code === 'CH200') {
            // Don't show signup success toast - directly call getUser and navigate
            
            // Immediately call getUser API to get screenName
            try {
              const userResponse = await api.get<GetUserResponse>('auth/getUser')
              if (userResponse.status === 'success' && userResponse.data?.screenName) {
                // Navigate based on screenName
                const screenName = userResponse.data.screenName.toLowerCase()
                const routeMap: Record<string, string> = {
                  personaldetails: '/dashboard/personaldetails',
                  careerdetails: '/dashboard/careerdetails',
                  socialdetails: '/dashboard/socialdetails',
                  srcmdetails: '/dashboard/srcmdetails',
                  familydetails: '/dashboard/familydetails',
                  partnerpreferences: '/dashboard/partnerpreferences',
                  aboutyou: '/dashboard/aboutyou',
                  underverification: '/under-verification',
                  dashboard: '/dashboard',
                }

                const route = routeMap[screenName] || '/dashboard/personaldetails'
                navigate(route, { replace: true })
              } else {
                navigate('/dashboard/personaldetails', { replace: true })
              }
            } catch (error) {
              console.error('Error fetching user:', error)
              navigate('/dashboard/personaldetails', { replace: true })
            }
          } else {
            // Check for err field (string or object with msg) in response
            const errorMessage = 
              (typeof (signupResponse as any).err === 'string' ? (signupResponse as any).err : null) ||
              ((signupResponse as any).err?.msg) ||
              signupResponse.message ||
              'Registration failed'
            showToast(errorMessage, 'error')
          }
        } catch (error) {
          // Extract the actual API error message (remove "API 400: " prefix)
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          const extractedMessage = errorMessage.replace(/^API \d+:?\s*/, '').trim()
          
          // Use the extracted message if it's meaningful, otherwise use fallback
          const finalMessage = extractedMessage && extractedMessage !== 'Bad Request' && extractedMessage !== 'Unknown error'
            ? extractedMessage
            : 'Registration failed'
          
          showToast(finalMessage, 'error')
        }
      } else {
        showToast(verifyResponse.message || 'OTP verification failed', 'error')
      }
    } catch (error) {
      // Extract the actual API error message (remove "API 400: " prefix)
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed'
      const extractedMessage = errorMessage.replace(/^API \d+:?\s*/, '').trim()
      
      // Use the extracted message if it's meaningful, otherwise use fallback
      const finalMessage = extractedMessage && extractedMessage !== 'Bad Request' && extractedMessage !== 'Unknown error'
        ? extractedMessage
        : 'OTP verification failed'
      
      showToast(finalMessage, 'error')
    } finally {
      setOtpLoading(false)
      setOtpModalOpen(false)
    }
  }

  return (
    <section className="section-shell">
      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className="hidden min-h-[70vh] rounded-3xl bg-cover bg-center lg:block"
          style={{ backgroundImage: "url('/homeScreenPic.png')" }}
        />
        <div className="glass-panel space-y-8">
          <div className="text-right">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-pink-500">
                Log in
              </Link>
            </p>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-semibold text-slate-900">Sign Up</h1>
            <p className="text-sm text-slate-500">Fill in your basic details.</p>
          </div>
          <form className="space-y-4" onSubmit={handleBasicSubmit}>
            <TextInput
              label="Full Name"
              required
              placeholder="Enter full name"
              value={basic.fullName}
              onChange={(event) => setBasic((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <TextInput
              label="Email"
              type="email"
              required
              placeholder="Enter email"
              value={basic.email}
              onChange={(event) => setBasic((prev) => ({ ...prev, email: event.target.value }))}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Mobile Number <span className="text-pink-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCountryCodeModalOpen(true)}
                  className="flex min-w-[100px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
                >
                  <span>{basic.countryCode || '+91'}</span>
                  <span className="text-slate-300">⌄</span>
                </button>
                <input
                  type="tel"
                  required
                  placeholder="90000 00000"
                  value={basic.phone}
                  onChange={(event) => setBasic((prev) => ({ ...prev, phone: event.target.value }))}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
                />
              </div>
            </div>
            <div className="relative">
              <TextInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={basic.password}
                onChange={(event) => setBasic((prev) => ({ ...prev, password: event.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="relative">
              <TextInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm your password"
                value={basic.confirmPassword}
                onChange={(event) =>
                  setBasic((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[38px] text-slate-400 transition hover:text-slate-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={basic.agree}
                onChange={(event) =>
                  setBasic((prev) => ({ ...prev, agree: event.target.checked }))
                }
              />
              I agree to terms and conditions
            </label>
            <Button type="submit" size="lg" fullWidth disabled={loading || otpLoading}>
              {loading || otpLoading ? 'Please wait...' : 'Register now'}
            </Button>
          </form>
        </div>
      </div>
      {showAlert && (
        <Alert message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
      <OtpModal
        open={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false)
          setOtpLoading(false)
        }}
        onVerify={handleOtpVerify}
      />
      {countryCodeModalOpen && (
        <SelectModal
          isOpen
          title="Select Country Code"
          options={COUNTRY_CODES.map((c) => `${c.label} ${c.value}`)}
          searchable
          selected={basic.countryCode}
          onClose={() => setCountryCodeModalOpen(false)}
          onConfirm={(value) => {
            const selected = COUNTRY_CODES.find((c) => `${c.label} ${c.value}` === value)
            if (selected) {
              setBasic((prev) => ({ ...prev, countryCode: selected.value }))
            }
            setCountryCodeModalOpen(false)
          }}
        />
      )}
    </section>
  )
}
