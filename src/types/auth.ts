// Authentication token structure
export type AuthState = {
  token: string | null
  user?: UserProfile
}

// User profile data from authentication
export type UserProfile = {
  id: string
  email: string
  name: string
  avatar?: string | null
  membershipTier?: 'Free' | 'Essential' | 'Signature' | 'Elite Concierge'
  verified?: boolean
}

// Login credentials
export type LoginCredentials = {
  email: string
  password: string
}

// Registration data
export type RegisterData = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agree: boolean
}

// API response types
export type AuthResponse = {
  code: string
  status: string
  message: string
  id: string
  token: string
  screenName: string
}

export type AuthError = {
  message: string
  code?: string
  field?: string
}