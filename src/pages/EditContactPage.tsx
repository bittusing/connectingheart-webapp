import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { TextInput } from '../components/forms/TextInput'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'

export const EditContactPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()

  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    alternateEmail: '',
    altMobileNumber: '',
    landline: '',
  })

  const [submitting, setSubmitting] = useState(false)

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.contact.email || '',
        phoneNumber: profile.contact.phoneNumber || '',
        alternateEmail: profile.contact.alternateEmail || profile.contact.alternateEmailId || '',
        altMobileNumber: profile.contact.altMobileNumber || profile.contact.alternateMobileNo || '',
        landline: profile.contact.landline || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Prepare payload matching the API structure
      const updatePayload: any = {
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        alternateEmail: formData.alternateEmail || undefined,
        altMobileNumber: formData.altMobileNumber || undefined,
        landline: formData.landline || undefined,
        section: 'contact',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      // Always include section
      updatePayload.section = 'contact'

      const response = await api.patch<typeof updatePayload, { code: string; status: string; message: string }>(
        'personalDetails/editProfile',
        updatePayload,
      )

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Profile updated successfully!', 'success')
        navigate('/dashboard/myprofile')
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message.replace('API ', '') || 'Failed to update profile.' : 'Failed to update profile.'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <TextInput
              label="Email Id"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter Email Id"
            />

            <TextInput
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="Enter Phone Number"
            />

            <TextInput
              label="Alternate Mobile Number"
              type="tel"
              value={formData.altMobileNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, altMobileNumber: e.target.value }))}
              placeholder="Enter Mobile Number"
            />

            <TextInput
              label="Alternate Email Id"
              type="email"
              value={formData.alternateEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, alternateEmail: e.target.value }))}
              placeholder="Enter Email Id"
            />

            <TextInput
              label="Landline No"
              type="tel"
              value={formData.landline}
              onChange={(e) => setFormData((prev) => ({ ...prev, landline: e.target.value }))}
              placeholder="Enter Landline No"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" size="lg" disabled={submitting} className="w-full max-w-md">
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  )
}
