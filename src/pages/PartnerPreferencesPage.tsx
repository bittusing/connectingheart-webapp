import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { FormPageLayout } from '../components/forms/FormPageLayout'
import { TextInput } from '../components/forms/TextInput'
import { useApiClient } from '../hooks/useApiClient'
import { useUpdateLastActiveScreen } from '../hooks/useUpdateLastActiveScreen'
import { useUserProfile } from '../hooks/useUserProfile'
import { showToast } from '../utils/toast'

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

type UpdateResponse = {
  code?: string
  status: string
  message?: string
}

export const PartnerPreferencesPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()
  const { loading: profileLoading } = useUserProfile()

  const [formData, setFormData] = useState({
    partnerPreferences: '',
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkScreenName = async () => {
      try {
        const userResponse = await api.get<GetUserResponse>('auth/getUser')
        if (userResponse.status === 'success' && userResponse.data?.screenName) {
          const screenName = userResponse.data.screenName.toLowerCase()
          const routeMap: Record<string, string> = {
            personaldetails: '/dashboard/personaldetails',
            careerdetails: '/dashboard/careerdetails',
            socialdetails: '/dashboard/socialdetails',
            srcmdetails: '/dashboard/srcmdetails',
            familydetails: '/dashboard/familydetails',
            partnerpreferences: '/dashboard/partnerpreferences',
            aboutyou: '/dashboard/aboutyou',
            dashboard: '/dashboard',
          }

          if (screenName !== 'partnerpreferences' && routeMap[screenName]) {
            navigate(routeMap[screenName], { replace: true })
          }
        }
      } catch (error) {
        console.error('Error checking screenName:', error)
      }
    }
    checkScreenName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        partnerPreferences: formData.partnerPreferences || undefined,
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      const response = await api.patch<typeof payload, UpdateResponse>('personalDetails', payload)

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Partner preferences updated successfully', 'success')
        await updateLastActiveScreen('aboutyou')
        const userResponse = await api.get<GetUserResponse>('auth/getUser')
        if (userResponse.status === 'success' && userResponse.data?.screenName) {
          const screenName = userResponse.data.screenName.toLowerCase()
          const routeMap: Record<string, string> = {
            personaldetails: '/dashboard/personaldetails',
            careerdetails: '/dashboard/careerdetails',
            socialdetails: '/dashboard/socialdetails',
            srcmdetails: '/dashboard/srcmdetails',
            familydetails: '/dashboard/familydetails',
            partnerpreferences: '/dashboard/partnerpreferences',
            aboutyou: '/dashboard/aboutyou',
            dashboard: '/dashboard',
          }
          const route = routeMap[screenName] || '/dashboard/aboutyou'
          navigate(route, { replace: true })
        } else {
          navigate('/dashboard/aboutyou', { replace: true })
        }
      } else {
        showToast(response.message || 'Failed to update partner preferences', 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update partner preferences'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (profileLoading) {
    return (
      <FormPageLayout title="Partner Preferences" subtitle="Share your partner preferences.">
        <div className="text-center">Loading...</div>
      </FormPageLayout>
    )
  }

  return (
    <FormPageLayout title="Partner Preferences" subtitle="Share your partner preferences.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <TextInput
          label="Partner Preferences"
          placeholder="Describe your partner preferences"
          value={formData.partnerPreferences}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              partnerPreferences: event.target.value,
            }))
          }
        />
        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" fullWidth disabled={submitting}>
            {submitting ? 'Saving...' : 'Next'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard/familydetails', { replace: true })}
          >
            ← Back
          </Button>
        </div>
      </form>
    </FormPageLayout>
  )
}
 