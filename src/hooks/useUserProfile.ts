import { useCallback, useEffect, useState } from 'react'
import { useApiClient } from './useApiClient'

type UserProfilePicture = {
  s3Link: string
  id: string
  primary?: boolean
}

type UserProfileApiData = {
  _id: string
  name?: string
  email?: string
  phoneNumber?: string
  heartsId?: number
  heartCoins?: number
  planName?: string
  description?: string
  isVerified?: boolean
  gender?: string
  profilePic?: UserProfilePicture[]
}

type UserProfileResponse = {
  code: string
  status: string
  message: string
  data: UserProfileApiData
}

export type UserProfile = UserProfileApiData & {
  avatarUrl?: string | null
}

const buildAvatarUrl = (profilePics: UserProfilePicture[] | undefined, userId: string) => {
  if (!profilePics || profilePics.length === 0 || !userId) return null

  const primaryPic = profilePics.find((pic) => pic.primary) ?? profilePics[0]
  if (!primaryPic?.id) return null

  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'https://backend.prod.connectingheart.co'
  const cleanPath = `/api/profile/file/${userId}/${primaryPic.id}`.replace(/\/+/g, '/')
  return `${baseUrl}${cleanPath}`
}

export const useUserProfile = () => {
  const { get } = useApiClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await get<UserProfileResponse>('auth/getUser')

      if (response.status === 'success' && response.data) {
        setProfile({
          ...response.data,
          avatarUrl: buildAvatarUrl(response.data.profilePic, response.data._id),
        })
      } else {
        throw new Error(response.message || 'Failed to fetch user profile.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile.'
      setError(errorMessage)
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}


