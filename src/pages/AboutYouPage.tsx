import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { CounterTextarea } from '../components/forms/FormComponents'
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

export const AboutYouPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()
  const { loading: profileLoading } = useUserProfile()

  const [formData, setFormData] = useState({
    aboutMe: '',
    profilePic: '',
    profilePicName: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://backendapp.connectingheart.co.in/').replace(/\/$/, '')

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
            underverification: '/under-verification',
            dashboard: '/dashboard',
          }

          if (screenName !== 'aboutyou' && routeMap[screenName]) {
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

  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview)
      }
    }
  }, [uploadPreview])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size should be less than 5MB.')
      return
    }

    setSelectedFile(file)
    setUploadPreview(URL.createObjectURL(file))
    setUploadError(null)
  }

  const uploadProfileImage = async () => {
    if (!selectedFile) {
      setUploadError('Please choose a file to upload.')
      return
    }

    const token = window.localStorage.getItem('connectingheart-token')
    if (!token) {
      setUploadError('Please log in again to upload.')
      return
    }

    const uploadData = new FormData()
    uploadData.append('file', selectedFile)

    setUploadingImage(true)
    try {
      const response = await fetch(`${apiBaseUrl}/profile/uploadProfilePic`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      const uploadedUrl =
        data?.data?.url ||
        data?.data?.imageUrl ||
        data?.data?.fileUrl ||
        data?.data?.path ||
        data?.url ||
        ''

      if (!uploadedUrl) {
        throw new Error('Upload response missing image url')
      }

      setFormData((prev) => ({
        ...prev,
        profilePic: uploadedUrl,
        profilePicName: selectedFile.name,
      }))
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview)
      }
      setUploadPreview('')
      setSelectedFile(null)
      setUploadModalOpen(false)
      setUploadError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      setUploadError(message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        description: formData.aboutMe || undefined,
        profilePic: formData.profilePic || undefined,
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      const response = await api.patch<typeof payload, { status?: string; code?: string; message?: string }>('personalDetails', payload)

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('About you updated successfully', 'success')
        await updateLastActiveScreen('underVerification')
        navigate('/under-verification', { replace: true })
      } else {
        showToast(response.message || 'Failed to update about you', 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update about you'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard', { replace: true })
  }

  if (profileLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8f2ff] to-white">
        <div className="rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl">Loading...</div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white/95 p-8 shadow-[0_25px_70px_rgba(67,56,202,0.15)]">
        <div className="space-y-4 text-center">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full w-[100%] rounded-full bg-gradient-to-r from-[#ff4f8b] to-[#ffa0d2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Step 7 of 7
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">About you</h1>
            <p className="text-sm text-slate-500">Complete your profile by adding a photo and a short bio.</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
            <p className="mb-3 text-sm font-medium text-slate-600">Profile picture</p>
            {formData.profilePic ? (
              <>
                <img src={formData.profilePic} alt="Profile" className="mx-auto h-48 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-pink-500"
                  onClick={() => {
                    setUploadModalOpen(true)
                    setUploadError(null)
                    setSelectedFile(null)
                    setUploadPreview('')
                  }}
                >
                  Change image
                </button>
              </>
            ) : (
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center space-y-2 text-slate-500"
                onClick={() => {
                  setUploadModalOpen(true)
                  setUploadError(null)
                  setSelectedFile(null)
                  setUploadPreview('')
                }}
              >
                <span className="text-3xl text-pink-500">＋</span>
                <span>Upload</span>
              </button>
            )}
            {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
          </div>

          <CounterTextarea
            label="Tell us about yourself"
            value={formData.aboutMe}
            onChange={(value) => setFormData((prev) => ({ ...prev, aboutMe: value }))}
            maxLength={125}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Creating profile...' : 'Create my profile'}
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-pink-500 underline"
              onClick={handleSkip}
            >
              I will fill this later
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => navigate('/dashboard/partnerpreferences', { replace: true })}
            >
              ← Back
            </button>
          </div>
        </form>
      </div>

      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Image Upload</h3>
            <div className="mt-4 flex flex-col items-center gap-3">
              {uploadPreview ? (
                <img src={uploadPreview} alt="Preview" className="h-48 w-full rounded-2xl object-cover" />
              ) : (
                <div className="h-48 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50" />
              )}
              <input type="file" accept="image/*" onChange={handleFileSelect} />
              <Button
                type="button"
                className="w-full"
                disabled={!selectedFile || uploadingImage}
                onClick={uploadProfileImage}
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </Button>
              <button
                type="button"
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                onClick={() => {
                  setUploadModalOpen(false)
                  if (uploadPreview) {
                    URL.revokeObjectURL(uploadPreview)
                  }
                  setUploadPreview('')
                  setSelectedFile(null)
                  setUploadError(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
