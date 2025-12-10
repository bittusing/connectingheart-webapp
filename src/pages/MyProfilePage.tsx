import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useUserProfile } from '../hooks/useUserProfile'
import { useLookup } from '../hooks/useLookup'
import { useCountryLookup } from '../hooks/useCountryLookup'
import { getGenderPlaceholder } from '../utils/imagePlaceholders'
import { Button } from '../components/common/Button'
import { showToast } from '../utils/toast'

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  } catch {
    return dateString
  }
}

const formatHeight = (heightInInches: number): string => {
  const feet = Math.floor(heightInInches / 12)
  const inches = heightInInches % 12
  const meters = (heightInInches * 0.0254).toFixed(2)
  return `${feet}'${inches}"(${meters} mts)`
}

const incomeMap: Record<number, string> = {
  1: 'Rs. 0 - 1 Lakh',
  2: 'Rs. 1 - 2 Lakh',
  3: 'Rs. 2 - 3 Lakh',
  4: 'Rs. 3 - 4 Lakh',
  5: 'Rs. 4 - 5 Lakh',
  6: 'Rs. 5 - 7 Lakh',
  7: 'Rs. 7 - 10 Lakh',
  8: 'Rs. 10 - 15 Lakh',
  9: 'Rs. 15 - 20 Lakh',
  10: 'Rs. 20 - 30 Lakh',
  11: 'Rs. 30 - 50 Lakh',
  12: 'Rs. 50+ Lakh',
}

const formatMaritalStatus = (status: string | undefined): string => {
  if (!status) return ''
  const statusMap: Record<string, string> = {
    nvm: 'Never married',
    div: 'Divorced',
    wid: 'Widowed',
  }
  return statusMap[status.toLowerCase()] || status
}

const formatYesNo = (value: string | undefined): string => {
  if (!value) return ''
  const map: Record<string, string> = {
    y: 'Yes',
    n: 'No',
    yes0: 'Yes',
    no1: 'No',
  }
  return map[value.toLowerCase()] || value
}

const formatGender = (gender: string | undefined): string => {
  if (!gender) return 'Not Filled'
  const genderMap: Record<string, string> = {
    m: 'Male',
    f: 'Female',
    male: 'Male',
    female: 'Female',
  }
  return genderMap[gender.toLowerCase()] || gender
}

const calculateAge = (dob: string | undefined): number | null => {
  if (!dob) return null
  try {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  } catch {
    return null
  }
}

export const MyProfilePage = () => {
  const navigate = useNavigate()
  const { profile, loading, error, refetch } = useMyProfileData()
  const { profile: userProfile, refetch: refetchUserProfile } = useUserProfile()
  const { fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  
  // Labels for horoscope place of birth
  const [placeOfBirthLabels, setPlaceOfBirthLabels] = useState<{
    countryLabel?: string
    stateLabel?: string
    cityLabel?: string
  }>({})

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://backendapp.connectingheart.co/api').replace(/\/$/, '')

  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview)
      }
    }
  }, [uploadPreview])

  // Fetch labels for horoscope place of birth
  useEffect(() => {
    const fetchPlaceOfBirthLabels = async () => {
      if (!profile?.horoscope) return

      const { countryOfBirth, stateOfBirth, cityOfBirth } = profile.horoscope
      const labels: { countryLabel?: string; stateLabel?: string; cityLabel?: string } = {}

      // Fetch country label
      if (countryOfBirth && countryOptions.length > 0) {
        const country = countryOptions.find((c) => c.value === countryOfBirth)
        if (country) {
          labels.countryLabel = country.label
        }
      }

      // Fetch state label
      if (countryOfBirth && stateOfBirth) {
        try {
          const stateOptions = await fetchStates(countryOfBirth)
          const state = stateOptions.find((s) => s.value === stateOfBirth)
          if (state) {
            labels.stateLabel = state.label
          }
        } catch (error) {
          console.error('Error fetching state label:', error)
        }
      }

      // Fetch city label
      if (stateOfBirth && cityOfBirth) {
        try {
          const cityOptions = await fetchCities(stateOfBirth)
          const city = cityOptions.find((c) => c.value === cityOfBirth)
          if (city) {
            labels.cityLabel = city.label
          }
        } catch (error) {
          console.error('Error fetching city label:', error)
        }
      }

      setPlaceOfBirthLabels(labels)
    }

    if (profile && countryOptions.length > 0) {
      fetchPlaceOfBirthLabels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.horoscope?.countryOfBirth, profile?.horoscope?.stateOfBirth, profile?.horoscope?.cityOfBirth, countryOptions.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error || 'Failed to load profile. Please try refreshing the page.'}
        </p>
      </div>
    )
  }

  const profileId = profile.miscellaneous.heartsId ? `HEARTS-${profile.miscellaneous.heartsId}` : 'N/A'
  const enriched = profile.enriched || {}
  // Get clientID - check if it exists in miscellaneous, otherwise use userProfile._id or heartsId as fallback
  // The API might return clientID in miscellaneous or we might need to get it from userProfile
  const clientID = (profile.miscellaneous as any).clientID || (profile as any).clientID || userProfile?._id || profile.miscellaneous.heartsId?.toString()
  // Use avatarUrl from userProfile (same as drawer) or construct from profilePic
  const primaryPic = profile.miscellaneous.profilePic?.find((pic) => pic.primary) || profile.miscellaneous.profilePic?.[0]
  const avatarUrlFromProfile = primaryPic?.id && clientID
    ? `https://backendapp.connectingheart.co.in/api/profile/file/${clientID}/${primaryPic.id}`
    : null
  
  // Debug: Log profile pictures
  console.log('Profile Pictures:', profile.miscellaneous.profilePic)
  console.log('Client ID:', clientID)
  console.log('Hearts ID:', profile.miscellaneous.heartsId)
  console.log('Miscellaneous:', profile.miscellaneous)
  // Prefer userProfile.avatarUrl (same source as drawer) for consistency
  const avatarUrl = userProfile?.avatarUrl || avatarUrlFromProfile
  const age = calculateAge(profile.critical.dob)
  const displayName = profile.basic.name || 'Not Filled'
  const displayAge = age !== null ? `${age} yrs` : ''
  const displayLocation = [enriched.cityLabel, enriched.stateLabel, enriched.countryLabel].filter(Boolean).join(', ') || 'Not Filled'

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }

    setSelectedFile(file)
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview)
    }
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

    const formData = new FormData()
    formData.append('profilePhoto', selectedFile)
    formData.append('primary', 'true')

    setUploadingImage(true)
    setUploadError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/profile/uploadProfilePic`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      // Get response text first to handle potential non-JSON responses
      const responseText = await response.text()
      
      // Try to parse as JSON, handling cases where response might have a prefix like "1 {...}"
      let data: any = {}
      let parseSuccess = false
      
      try {
        // Remove any leading numbers or whitespace (API might return "1 {...}")
        const cleanedText = responseText.trim().replace(/^\d+\s*/, '')
        if (cleanedText) {
          data = JSON.parse(cleanedText)
          parseSuccess = true
        }
      } catch (parseError) {
        // If parsing fails, log but don't fail if response is ok
        console.warn('Response parsing warning:', parseError, 'Response text:', responseText.substring(0, 100))
      }

      // Check for success - if response status is 200-299, consider it success
      // The API might return 200 even if the JSON format is unusual
      const isSuccess = response.status >= 200 && response.status < 300
      
      if (isSuccess) {
        // Success - refetch profile data
        showToast('Profile picture uploaded successfully!', 'success')
        if (uploadPreview) {
          URL.revokeObjectURL(uploadPreview)
        }
        setUploadModalOpen(false)
        setSelectedFile(null)
        setUploadPreview('')
        setUploadError(null)
        // Refetch profile to get updated image
        await refetch()
        // Also refetch user profile if available
        if (refetchUserProfile) {
          try {
            await refetchUserProfile()
          } catch {
            // Ignore user profile refetch errors
          }
        }
      } else {
        // Response not ok - show error
        const errorMessage = parseSuccess ? (data.message || data.error || 'Failed to upload image') : `Failed to upload image (Status: ${response.status})`
        throw new Error(errorMessage)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      setUploadError(message)
      showToast(message, 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUploadAdditionalPhoto = async (file: File) => {
    const token = window.localStorage.getItem('connectingheart-token')
    if (!token) {
      showToast('Please log in again to upload.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('profilePhoto', file)
    formData.append('primary', 'false')

    setUploadingPhotoId('uploading')
    try {
      const response = await fetch(`${apiBaseUrl}/profile/uploadProfilePic`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const responseText = await response.text()
      let data: any = {}
      
      try {
        const cleanedText = responseText.trim().replace(/^\d+\s*/, '')
        if (cleanedText) {
          data = JSON.parse(cleanedText)
        }
      } catch (parseError) {
        console.warn('Response parsing warning:', parseError)
      }

      if (response.ok || response.status >= 200 && response.status < 300) {
        showToast('Photo uploaded successfully!', 'success')
        await refetch()
        if (refetchUserProfile) {
          try {
            await refetchUserProfile()
          } catch {
            // Ignore user profile refetch errors
          }
        }
      } else {
        throw new Error(data.message || data.error || 'Failed to upload photo')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload photo'
      showToast(message, 'error')
    } finally {
      setUploadingPhotoId(null)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return
    }

    const token = window.localStorage.getItem('connectingheart-token')
    if (!token) {
      showToast('Please log in again to delete.', 'error')
      return
    }

    setDeletingPhotoId(photoId)
    try {
      const response = await fetch(`${apiBaseUrl}/profile/deleteProfilePic/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (response.ok || response.status >= 200 && response.status < 300) {
        showToast('Photo deleted successfully!', 'success')
        await refetch()
        if (refetchUserProfile) {
          try {
            await refetchUserProfile()
          } catch {
            // Ignore user profile refetch errors
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Failed to delete photo')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete photo'
      showToast(message, 'error')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  const handlePhotoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error')
      return
    }

    handleUploadAdditionalPhoto(file)
    // Reset input
    event.target.value = ''
  }


  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <img
              src={uploadPreview || avatarUrl || getGenderPlaceholder(userProfile?.gender || 'M')}
              alt={displayName}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-100 dark:ring-pink-900/30"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = getGenderPlaceholder(userProfile?.gender || 'M')
              }}
            />
            <button
              onClick={() => setUploadModalOpen(true)}
              className="absolute bottom-0 right-0 rounded-full bg-pink-500 p-2 text-white shadow-lg transition hover:bg-pink-600"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{profileId}</p>
            {displayName && displayName !== 'Not Filled' && (
              <p className="mt-1 text-lg font-medium text-slate-700 dark:text-slate-300">{displayName}</p>
            )}
            {displayAge && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{displayAge}</p>
            )}
            {displayLocation && displayLocation !== 'Not Filled' && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">{displayLocation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !uploadingImage && setUploadModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Image Upload</h3>
              <button
                onClick={() => {
                  if (!uploadingImage) {
                    setUploadModalOpen(false)
                    setSelectedFile(null)
                    if (uploadPreview) {
                      URL.revokeObjectURL(uploadPreview)
                    }
                    setUploadPreview('')
                    setUploadError(null)
                  }
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                disabled={uploadingImage}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Choose File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploadingImage}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                {selectedFile && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedFile.name}</p>
                )}
              </div>

              {uploadPreview && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="mx-auto max-h-48 w-full rounded-lg object-contain"
                  />
                </div>
              )}

              {uploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={uploadProfileImage}
                  disabled={!selectedFile || uploadingImage}
                  className="flex-1"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setUploadModalOpen(false)
                    setSelectedFile(null)
                    if (uploadPreview) {
                      URL.revokeObjectURL(uploadPreview)
                    }
                    setUploadPreview('')
                    setUploadError(null)
                  }}
                  disabled={uploadingImage}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Photos</h2>
        </div>
        {profile.miscellaneous.profilePic && profile.miscellaneous.profilePic.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Display existing photos */}
            {profile.miscellaneous.profilePic.map((pic) => {
              // Use clientID for image URL (same as other parts of the app)
              const imageUrl = `https://backendapp.connectingheart.co.in/api/profile/file/${clientID}/${pic.id}`
              const isDeleting = deletingPhotoId === pic.id
              return (
                <div key={pic.id || pic._id} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = getGenderPlaceholder(userProfile?.gender || 'M')
                    }}
                  />
                  {pic.primary && (
                    <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  <button
                    onClick={() => !isDeleting && handleDeletePhoto(pic.id)}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete photo"
                  >
                    {isDeleting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <XMarkIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )
            })}
            
            {/* Add More Photos Button */}
            <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-pink-400 hover:bg-pink-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-pink-500 dark:hover:bg-pink-900/20">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFileSelect}
                disabled={uploadingPhotoId !== null}
                className="hidden"
              />
              {uploadingPhotoId === 'uploading' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-8 w-8 text-slate-400 dark:text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Add Photo</span>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Show placeholder when no photos */}
            <div className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <img
                  src={getGenderPlaceholder(userProfile?.gender || 'M')}
                  alt="No photos"
                  className="h-24 w-24 mx-auto opacity-50"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No photos yet</p>
              </div>
            </div>
            
            {/* Add More Photos Button */}
            <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-pink-400 hover:bg-pink-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-pink-500 dark:hover:bg-pink-900/20">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFileSelect}
                disabled={uploadingPhotoId !== null}
                className="hidden"
              />
              {uploadingPhotoId === 'uploading' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-8 w-8 text-slate-400 dark:text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Add Photo</span>
                </div>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Profile Details Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Profile Details</h2>
          <button
            onClick={() => navigate('/dashboard/editprofilebasic')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow label="Name" value={profile.basic.name || 'Not Filled'} />
          <DetailRow label="Gender" value={formatGender(userProfile?.gender)} />
          <DetailRow label="Religion" value={enriched.religionLabel || 'Not Filled'} />
          <DetailRow label="Mother Tongue" value={enriched.motherTongueLabel || 'Not Filled'} />
          <DetailRow label="Residential Status" value={enriched.residentialStatusLabel || 'Not Filled'} />
          <DetailRow label="Country" value={enriched.countryLabel || 'Not Filled'} />
          <DetailRow label="State" value={enriched.stateLabel || 'Not Filled'} />
          <DetailRow label="City" value={enriched.cityLabel || 'Not Filled'} />
          <DetailRow label="Income" value={incomeMap[profile.basic.income] || 'Not Filled'} />
          <DetailRow label="Caste" value={enriched.castLabel || 'Not Filled'} />
          <DetailRow label="Height" value={profile.basic.height ? formatHeight(profile.basic.height) : 'Not Filled'} />
        </div>
      </div>

      {/* Critical Field Section */}
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-red-600 dark:text-red-400">
            Critical Field
          </h2>
          {/* <button
            onClick={() => navigate('/dashboard/personaldetails')}
            className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            <PencilIcon className="h-5 w-5" />
          </button> */}
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="Date of Birth"
            value={profile.critical.dob ? formatDate(profile.critical.dob) : 'Not Filled'}
            isNotFilled={!profile.critical.dob}
          />
          <DetailRow
            label="Marital Status"
            value={enriched.maritalStatusLabel || 'Not Filled'}
            isNotFilled={!profile.critical.maritalStatus}
          />
        </div>
      </div>

      {/* About Me Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">About Me</h2>
          <button
            onClick={() => navigate('/dashboard/editabout')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="Tell us About YourSelf"
            value={profile.about.description || profile.about.aboutYourself || 'Not Filled'}
            isNotFilled={!profile.about.description && !profile.about.aboutYourself}
          />
          <DetailRow
            label="Profile Managed By"
            value={enriched.managedByLabel || 'Not Filled'}
            isNotFilled={!profile.about.managedBy}
          />
          <DetailRow
            label="Disability"
            value={enriched.disabilityLabel || 'Not Filled'}
            isNotFilled={!profile.about.disability}
          />
          <DetailRow
            label="Body Type"
            value={enriched.bodyTypeLabel || 'Not Filled'}
            isNotFilled={!profile.about.bodyType}
          />
          <DetailRow
            label="Thalassemia"
            value={enriched.thalassemiaLabel || 'Not Filled'}
            isNotFilled={!profile.about.thalassemia}
          />
          <DetailRow
            label="HIV Positive"
            value={formatYesNo(profile.about.hivPositive)}
            isNotFilled={!profile.about.hivPositive}
          />
        </div>
      </div>

      {/* Education Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Education</h2>
          <button
            onClick={() => navigate('/dashboard/editeducation')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="About My Education"
            value={profile.education.aboutEducation || 'Not Filled'}
            isNotFilled={!profile.education.aboutEducation}
          />
          <DetailRow label="Qualification" value={enriched.qualificationLabel || 'Not Filled'} />
          <DetailRow
            label="Other UG Degree"
            value={profile.education.otherUGDegree || 'Not Filled'}
            isNotFilled={!profile.education.otherUGDegree}
          />
          <DetailRow
            label="School"
            value={profile.education.school || 'Not Filled'}
            isNotFilled={!profile.education.school}
          />
        </div>
      </div>

      {/* Career Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Career</h2>
          <button
            onClick={() => navigate('/dashboard/editcareer')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="About My Career"
            value={profile.career.aboutMyCareer || 'Not Filled'}
            isNotFilled={!profile.career.aboutMyCareer}
          />
          <DetailRow
            label="Employed In"
            value={enriched.employedInLabel || 'Not Filled'}
            isNotFilled={!profile.career.employed_in}
          />
          <DetailRow
            label="Occupation"
            value={enriched.occupationLabel || 'Not Filled'}
            isNotFilled={!profile.career.occupation}
          />
          <DetailRow
            label="Organisation Name"
            value={profile.career.organisationName || 'Not Filled'}
            isNotFilled={!profile.career.organisationName}
          />
          <DetailRow
            label="Interested In Settling Abroad"
            value={enriched.interestedInSettlingAbroadLabel || 'Not Filled'}
            isNotFilled={!profile.career.interestedInSettlingAbroad}
          />
        </div>
      </div>

      {/* Family Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Family</h2>
          <button
            onClick={() => navigate('/dashboard/editfamily')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="About My Family"
            value={profile.family.aboutMyFamily || profile.family.aboutFamily || 'Not Filled'}
            isNotFilled={!profile.family.aboutMyFamily && !profile.family.aboutFamily}
          />
          <DetailRow
            label="Family Status"
            value={enriched.familyStatusLabel || 'Not Filled'}
            isNotFilled={!profile.family.familyStatus}
          />
          <DetailRow
            label="Family Type"
            value={enriched.familyTypeLabel || 'Not Filled'}
            isNotFilled={!profile.family.familyType}
          />
          <DetailRow
            label="Family Values"
            value={enriched.familyValuesLabel || 'Not Filled'}
            isNotFilled={!profile.family.familyValues}
          />
          <DetailRow
            label="Family Income"
            value={enriched.familyIncomeLabel || 'Not Filled'}
            isNotFilled={!profile.family.familyIncome}
          />
          <DetailRow
            label="Father Is"
            value={enriched.fatherOccupationLabel || 'Not Filled'}
            isNotFilled={!profile.family.fatherOccupation}
          />
          <DetailRow
            label="Mother Is"
            value={enriched.motherOccupationLabel || 'Not Filled'}
            isNotFilled={!profile.family.motherOccupation}
          />
          <DetailRow
            label="Brothers"
            value={profile.family.brothers || 'Not Filled'}
            isNotFilled={!profile.family.brothers}
          />
          <DetailRow
            label="Married Brothers"
            value={profile.family.marriedBrothers || 'Not Filled'}
            isNotFilled={!profile.family.marriedBrothers}
          />
          <DetailRow
            label="Sisters"
            value={profile.family.sisters || 'Not Filled'}
            isNotFilled={!profile.family.sisters}
          />
          <DetailRow
            label="Married Sisters"
            value={profile.family.marriedSisters || 'Not Filled'}
            isNotFilled={!profile.family.marriedSisters}
          />
          <DetailRow
            label="Gothra"
            value={profile.family.gothra || 'Not Filled'}
            isNotFilled={!profile.family.gothra}
          />
          <DetailRow
            label="Living With Parents"
            value={formatYesNo(profile.family.livingWithParents) || 'Not Filled'}
            isNotFilled={!profile.family.livingWithParents}
          />
          <DetailRow
            label="Family Based"
            value={enriched.familyBasedOutOfLabel || 'Not Filled'}
            isNotFilled={!profile.family.familyBasedOutOf}
          />
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Contact Details</h2>
          <button
            onClick={() => navigate('/dashboard/editcontact')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow label="Mobile Number" value={profile.contact.phoneNumber || 'Not Filled'} />
          <DetailRow label="Email Id" value={profile.contact.email || 'Not Filled'} />
          <DetailRow
            label="Alternate Mobile No"
            value={profile.contact.altMobileNumber || profile.contact.alternateMobileNo || 'Not Filled'}
            isNotFilled={!profile.contact.altMobileNumber && !profile.contact.alternateMobileNo}
          />
          <DetailRow
            label="Alternate Email Id"
            value={profile.contact.alternateEmail || profile.contact.alternateEmailId || 'Not Filled'}
            isNotFilled={!profile.contact.alternateEmail && !profile.contact.alternateEmailId}
          />
          <DetailRow
            label="Landline"
            value={profile.contact.landline || 'Not Filled'}
            isNotFilled={!profile.contact.landline}
          />
        </div>
      </div>

      {/* Horoscope Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Horoscope</h2>
          <button
            onClick={() => navigate('/dashboard/edithoroscope')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="Rashi"
            value={enriched.rashiLabel || 'Not Filled'}
            isNotFilled={!profile.horoscope.rashi}
          />
          <DetailRow
            label="Nakshatra"
            value={enriched.nakshatraLabel || 'Not Filled'}
            isNotFilled={!profile.horoscope.nakshatra}
          />
          <DetailRow
            label="Place Of Birth"
            value={
              [placeOfBirthLabels.cityLabel, placeOfBirthLabels.stateLabel, placeOfBirthLabels.countryLabel]
                .filter(Boolean)
                .join(', ') || 'Not Filled'
            }
            isNotFilled={!profile.horoscope.cityOfBirth && !profile.horoscope.stateOfBirth && !profile.horoscope.countryOfBirth}
          />
          <DetailRow
            label="Time of Birth"
            value={profile.horoscope.timeOfBirth || 'Not Filled'}
            isNotFilled={!profile.horoscope.timeOfBirth}
          />
          <DetailRow label="Manglik" value={enriched.manglikLabel || 'Not Filled'} />
          <DetailRow label="Horoscope" value={enriched.horoscopeLabel || 'Not Filled'} />
        </div>
      </div>

      {/* Life Style Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Life Style</h2>
          <button
            onClick={() => navigate('/dashboard/editlifestyle')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-6">
          {/* Habits */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Habits</h3>
            <div className="space-y-3">
              <DetailRow label="Dietary Habits" value={enriched.dietaryHabitsLabel || 'Not Filled'} />
              <DetailRow label="Drinking Habits" value={enriched.drinkingHabitsLabel || 'Not Filled'} />
              <DetailRow label="Smoking Habits" value={enriched.smokingHabitsLabel || 'Not Filled'} />
            </div>
          </div>

          {/* Assets */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Assets</h3>
            <div className="space-y-3">
              <DetailRow label="Own a House?" value={formatYesNo(profile.lifeStyleData.ownAHouse) || 'Not Filled'} />
              <DetailRow label="Own a Car?" value={formatYesNo(profile.lifeStyleData.ownACar) || 'Not Filled'} />
              <DetailRow label="Open to Pets?" value={formatYesNo(profile.lifeStyleData.openToPets) || 'Not Filled'} />
            </div>
          </div>

          {/* Other Life Style Preferences */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Other Life Style Preferences</h3>
            <div className="space-y-3">
              <DetailRow
                label="Languages I Known"
                value={enriched.languagesLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.languagesLabels || enriched.languagesLabels.length === 0}
              />
              <DetailRow
                label="Hobbies"
                value={enriched.hobbiesLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.hobbiesLabels || enriched.hobbiesLabels.length === 0}
              />
              <DetailRow
                label="Interests"
                value={enriched.interestLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.interestLabels || enriched.interestLabels.length === 0}
              />
              <DetailRow
                label="Food i Cook"
                value={profile.lifeStyleData.foodICook || 'Not Filled'}
                isNotFilled={!profile.lifeStyleData.foodICook}
              />
              <DetailRow
                label="Favourite Music"
                value={enriched.favMusicLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.favMusicLabels || enriched.favMusicLabels.length === 0}
              />
              <DetailRow
                label="Favourite Read"
                value={profile.lifeStyleData.favRead || 'Not Filled'}
                isNotFilled={!profile.lifeStyleData.favRead}
              />
              <DetailRow
                label="Dress Style"
                value={enriched.dressLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.dressLabels || enriched.dressLabels.length === 0}
              />
              <DetailRow
                label="Sports"
                value={enriched.sportsLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.sportsLabels || enriched.sportsLabels.length === 0}
              />
              <DetailRow
                label="Books"
                value={enriched.booksLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.booksLabels || enriched.booksLabels.length === 0}
              />
              <DetailRow
                label="Favourite Cuisine"
                value={enriched.cuisineLabels?.join(', ') || 'Not Filled'}
                isNotFilled={!enriched.cuisineLabels || enriched.cuisineLabels.length === 0}
              />
              <DetailRow
                label="Favourite Movies"
                value={profile.lifeStyleData.movies || 'Not Filled'}
                isNotFilled={!profile.lifeStyleData.movies}
              />
              <DetailRow
                label="Favourite Tv Shows"
                value={profile.lifeStyleData.favTVShow || 'Not Filled'}
                isNotFilled={!profile.lifeStyleData.favTVShow}
              />
              <DetailRow
                label="Vacation Destination"
                value={profile.lifeStyleData.vacayDestination || 'Not Filled'}
                isNotFilled={!profile.lifeStyleData.vacayDestination}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DetailRow = ({ label, value, isNotFilled }: { label: string; value: string; isNotFilled?: boolean }) => (
  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:gap-4">
    <span className="w-full flex-shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-48">
      {label}:
    </span>
    <span
      className={`flex-1 text-sm ${
        isNotFilled && value === 'Not Filled' ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'
      }`}
    >
      {value}
    </span>
  </div>
)
