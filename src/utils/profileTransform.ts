import type { ApiProfile } from '../types/api'
import type { ProfileCardData } from '../types/dashboard'



// Income mapping based on income level codes
const incomeMap: Record<number, string> = {
  1: 'Rs. 0 - 1 Lakh',
  2: 'Rs. 1 - 2 Lakh',
  3: 'Rs. 3 - 4 Lakh',
  4: 'Rs. 4 - 5 Lakh',
  5: 'Rs. 5 - 6 Lakh',
  6: 'Rs. 6 - 7 Lakh',
  7: 'Rs. 7.5 - 10 Lakh',
  8: 'Rs. 10 - 15 Lakh',
  9: 'Rs. 15 - 20 Lakh',
  10: 'Rs. 20 - 25 Lakh',
  11: 'Rs. 25 - 30 Lakh',
  12: 'Rs. 30 - 40 Lakh',
  13: 'Rs. 40 - 50 Lakh',
  14: 'Rs. 50+ Lakh',
}

// Convert height from inches to feet'inches" format
export const formatHeight = (inches: number): string => {
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  const meters = (inches * 0.0254).toFixed(2)
  return `${feet}'${remainingInches}" (${meters} mts)`
}

// Calculate age from date of birth
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Format location from codes (simplified - can be enhanced with proper mapping)
export const formatLocation = (city?: string, state?: string, country?: string): string => {
  // Handle undefined/null values
  const cityName = city ? city.replace(/_/g, ' ').replace(/\d+/g, '').trim() || city : 'N/A'
  const stateName = state ? state.replace(/_/g, ' ').replace(/\d+/g, '').trim() || state : 'N/A'
  const countryName = country ? country.replace(/_/g, ' ').replace(/\d+/g, '').trim() || country : 'N/A'
  return `${cityName}, ${stateName}, ${countryName}`
}

// Get primary profile picture URL
const getProfilePicture = (
  profilePics: ApiProfile['profilePic'],
  clientID: string,
): string | null => {
  if (!profilePics || profilePics.length === 0 || !clientID) return null
  const primaryPic = profilePics.find((pic) => pic.primary) || profilePics[0]
  if (!primaryPic || !primaryPic.id) return null
  
  // Use production backend URL for images: https://backend.prod.connectingheart.co
  // URL format: https://backend.prod.connectingheart.co/api/profile/file/{clientID}/{fileId}
  const imageBaseUrl = 'https://backendapp.connectingheart.co.in'
  // Ensure no double slashes in the path
  const cleanPath = `/api/profile/file/${clientID}/${primaryPic.id}`.replace(/\/+/g, '/')
  return `${imageBaseUrl}${cleanPath}`
}

/**
 * Transform API profile data to ProfileCardData format
 */
export const transformApiProfile = (apiProfile: ApiProfile): ProfileCardData => {
  try {
    const clientID = apiProfile.clientID || 'unknown'
    return {
      id: clientID,
      heartsId: apiProfile.heartsId,
      name: `HEARTS-${apiProfile.heartsId || 'N/A'}`, // Display name using heartsId (name not in API response)
      age: apiProfile.dob ? calculateAge(apiProfile.dob) : 0,
      height: apiProfile.height ? formatHeight(apiProfile.height) : 'N/A',
      income: apiProfile.income ? (incomeMap[apiProfile.income] || `Rs. ${apiProfile.income} Lakh`) : 'Not specified',
      caste: apiProfile.cast || undefined,
      location: formatLocation(apiProfile.city, apiProfile.state, apiProfile.country),
      avatar: getProfilePicture(apiProfile.profilePic, clientID),
      verified: apiProfile.isMembershipActive || false,
      gender: apiProfile.gender,
    }
  } catch (error) {
    console.error('Error transforming profile:', error, apiProfile)
    // Return a safe fallback profile
    return {
      id: apiProfile.clientID || 'unknown',
      heartsId: apiProfile.heartsId,
      name: `HEARTS-${apiProfile.heartsId || 'N/A'}`,
      age: 0,
      height: 'N/A',
      income: 'Not specified',
      location: 'Location not available',
      verified: false,
    }
  }
}

/**
 * Transform array of API profiles to ProfileCardData array
 */
export const transformApiProfiles = (apiProfiles: ApiProfile[]): ProfileCardData[] => {
  return apiProfiles.map(transformApiProfile)
}

