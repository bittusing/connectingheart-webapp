import { useCallback, useState } from 'react'
import { useApiClient } from './useApiClient'

type ApiResponse<T = Record<string, unknown>> = {
  code?: string
  status: string
  message?: string
  data?: T
  token?: string
}

type GenerateOtpPayload = {
  phoneNumber: string
  extension: string
}

type VerifyOtpPayload = {
  phoneNumber: string
  otp: string
}

type SignupPayload = {
  email: string
  password: string
  confirm_password: string
  name: string
  source: string
}

export const useRegistration = () => {
  const api = useApiClient()
  const [loading, setLoading] = useState(false)

  const generateOtp = useCallback(
    async (phoneNumber: string, extension: string) => {
      setLoading(true)
      try {
        const response = await api.post<GenerateOtpPayload, ApiResponse>('auth/generateOtp', {
          phoneNumber,
          extension,
        })
        return response
      } finally {
        setLoading(false)
      }
    },
    [api],
  )

  const verifyOtp = useCallback(
    async (phoneNumber: string, otp: string) => {
      setLoading(true)
      try {
        const response = await api.post<VerifyOtpPayload, ApiResponse>('auth/verifyOtp', {
          phoneNumber,
          otp,
        })

        if (response.status === 'success' && response.token) {
          window.localStorage.setItem('connectingheart-token', response.token)
        }

        return response
      } finally {
        setLoading(false)
      }
    },
    [api],
  )

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setLoading(true)
      try {
        const response = await api.post<SignupPayload, ApiResponse>('auth/signup', payload)
        return response
      } finally {
        setLoading(false)
      }
    },
    [api],
  )

  return {
    loading,
    generateOtp,
    verifyOtp,
    signup,
  }
}

