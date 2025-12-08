import type { ProfileDetailData } from '../types/profileView'
import type { ProfileViewData } from '../types/profile'

// Get profile picture URL
const getProfilePictureUrl = (clientID: string, fileId: string): string => {
  const imageBaseUrl = 'https://backendapp.connectingheart.co.in'
  return `${imageBaseUrl}/api/profile/file/${clientID}/${fileId}`
}

// Build profile picture metadata for carousel display
const buildProfilePictures = (
  profilePics: ProfileDetailData['miscellaneous']['profilePic'],
  clientID: string,
) => {
  if (!profilePics || profilePics.length === 0 || !clientID) return []
  return profilePics.map((pic) => ({
    id: pic.id,
    url: getProfilePictureUrl(clientID, pic.id),
    primary: Boolean(pic.primary),
  }))
}

// Format location from city, state, country
const formatLocation = (city?: string, state?: string, country?: string): string => {
  const parts = [city, state, country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'N/A'
}

// Calculate age from date of birth (format: DD/MM/YYYY)
const calculateAge = (dob: string): number => {
  if (!dob) return 0
  try {
    // Parse DD/MM/YYYY format
    const [day, month, year] = dob.split('/').map(Number)
    const birthDate = new Date(year, month - 1, day)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  } catch {
    return 0
  }
}

// Format time of birth (format: DD-MM-YYYY)
const formatTimeOfBirth = (tob?: string): string => {
  if (!tob) return ''
  try {
    // Parse DD-MM-YYYY format
    const [day, month, year] = tob.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return tob
  }
}

const dateofBirthWithTime = (dob?: string): string => { //   "tob": "2025-02-21T12:53:00.000Z",
  if (!dob) return ''
  try {
    const [date, time] = dob.split('T')
    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    return `${dateObj.toLocaleDateString('en-IN')} ${time.split('.')[0].slice(0, 5)} `
  } catch {
    return dob
  }
}

// Convert string or array to array
const toArray = (value: string | string[] | undefined): string[] | undefined => {
  if (!value) return undefined
  if (Array.isArray(value)) return value
  // If it's a comma-separated string, split it
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return undefined
}

// Format Y/N to Yes/No
const formatYesNo = (value?: string): string => {
  if (!value) return ''
  const normalized = value.trim().toUpperCase()
  if (normalized === 'Y' || normalized === 'YES') return 'Yes'
  if (normalized === 'N' || normalized === 'NO') return 'No'
  return value
}

// Transform new API data to display format (no lookup needed)
export const transformProfileDetailV1 = (data: ProfileDetailData): ProfileViewData => {
  const clientID = data.miscellaneous.clientID
  const allProfilePics = buildProfilePictures(data.miscellaneous.profilePic || [], clientID)
  const primaryPic = allProfilePics.find((pic) => pic.primary) || allProfilePics[0]

  const age = data.critical.dob ? calculateAge(data.critical.dob) : 0
  const profileId = `HEARTS-${data.miscellaneous.heartsId}`
  
  // Location is already formatted in the API response
  const location = formatLocation(
    data.miscellaneous.city,
    data.miscellaneous.state,
    data.miscellaneous.country
  )

  // Format income - already a string in new API
  const income = data.career.income || 'Not specified'
  
  // Format family income - convert number to string if needed
  const familyIncome = data.family.familyIncome
    ? typeof data.family.familyIncome === 'number'
      ? `Rs. ${data.family.familyIncome} Lakh`
      : data.family.familyIncome
    : undefined

  return {
    id: clientID,
    profileId,
    name: data.contact?.name || profileId,
    age,
    height: data.basic.height || 'N/A',
    location,
    avatar: primaryPic?.url || null,
    verified: data.miscellaneous.isMembershipActive,
    isShortlisted: Boolean(data.miscellaneous.isShortlisted),
    isIgnored: Boolean(data.miscellaneous.isIgnored),
    gender: data.miscellaneous.gender,

    // Basic details
    dateOfBirth: data.critical.dob || '',
    maritalStatus: data.critical.maritalStatus || '',
    caste: data.basic.cast || '',
    aboutMe: data.about.description || '',
    profileManagedBy: data.about.managedBy || '',
    bodyType: data.about.bodyType || '',
    thalassemia: data.about.thalassemia || '',
    hivPositive: data.about.hivPositive === 'N' || data.about.hivPositive === 'No' ? 'No' : data.about.hivPositive || 'N/A',
    disability: data.about.disability || '',

    // Education & career
    school: data.education.school || '',
    qualification: data.education.qualification || '',
    otherUGDegree: data.education.otherUGDegree || '',
    aboutEducation: data.education.aboutEducation || '',
    aboutCareer: data.career.aboutMyCareer || '',
    employedIn: data.career.employed_in || '',
    occupation: data.career.occupation || '',
    organisationName: data.career.organisationName || '',
    interestedInSettlingAbroad: formatYesNo(data.career.interestedInSettlingAbroad),
    income,

    // Family details
    familyDetails: {
      familyStatus: data.family.familyStatus || '',
      familyType: data.family.familyType || '',
      familyValues: data.family.familyValues || '',
      familyIncome,
      fatherOccupation: data.family.fatherOccupation || '',
      motherOccupation: data.family.motherOccupation || '',
      brothers: data.family.brothers ? Number(data.family.brothers) : undefined,
      marriedBrothers: data.family.marriedBrothers ? Number(data.family.marriedBrothers) : undefined,
      sisters: data.family.sisters ? Number(data.family.sisters) : undefined,
      marriedSisters: data.family.marriedSisters ? Number(data.family.marriedSisters) : undefined,
      aboutMyFamily: data.family.aboutMyFamily || '',
      familyBasedOutOf: data.family.familyBasedOutOf || '',
      gothra: data.family.gothra || '',
      livingWithParents: formatYesNo(data.family.livingWithParents),
    },

    // Kundali details
    kundaliDetails: {
      rashi: data.kundali.rashi || '',
      nakshatra: data.kundali.nakshatra || '',
      timeOfBirth: dateofBirthWithTime(data?.kundali?.tob),
      manglik: data.kundali.manglik || '',
      horoscope: data.kundali.horoscope || '',
    },

    // Lifestyle data
    lifestyleData: {
      dietaryHabits: data.lifeStyleData.dietaryHabits || '',
      drinkingHabits: data.lifeStyleData.drinkingHabits || '',
      smokingHabits: data.lifeStyleData.smokingHabits || '',
      languages: toArray(data.lifeStyleData.languages),
      hobbies: toArray(data.lifeStyleData.hobbies),
      interest: toArray(data.lifeStyleData.interest),
      sports: toArray(data.lifeStyleData.sports),
      cuisine: toArray(data.lifeStyleData.cuisine),
      movies: data.lifeStyleData.movies || '',
      books: toArray(data.lifeStyleData.books),
      dress: toArray(data.lifeStyleData.dress),
      favRead: data.lifeStyleData.favRead || '',
      favTVShow: data.lifeStyleData.favTVShow || '',
      vacayDestination: data.lifeStyleData.vacayDestination || '',
      openToPets: formatYesNo(data.lifeStyleData.openToPets),
      ownAHouse: formatYesNo(data.lifeStyleData.ownAHouse),
      ownACar: formatYesNo(data.lifeStyleData.ownACar),
      favMusic: toArray(data.lifeStyleData.favMusic),
      foodICook: formatYesNo(data.lifeStyleData.foodICook),
    },

    // Match details
    matchDetails: {
      matchPercentage: data.matchPercentage,
      matchData: data.matchData || [],
    },

    allProfilePics,
    isUnlocked: data.miscellaneous.isUnlocked,
    contactDetails: data.miscellaneous.isUnlocked && data.contact
      ? {
          phoneNumber: data.contact.phoneNumber || '',
          email: data.contact.email || '',
          name: data.contact.name || '',
          alternateEmail: data.contact.alternateEmail || '',
          altMobileNumber: data.contact.altMobileNumber || '',
          landline: data.contact.landline || '',
        }
      : undefined,
  }
}

