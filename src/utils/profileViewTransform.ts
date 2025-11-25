import type { ProfileDetailData } from '../types/profileView'
import { formatHeight, formatLocation } from './profileTransform'

// Get profile picture URL
export const getProfilePictureUrl = (clientID: string, fileId: string): string => {
  const imageBaseUrl = 'https://backend.prod.connectingheart.co'
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

// Format marital status
const formatMaritalStatus = (status?: string): string => {
  if (!status) return ''
  const statusMap: Record<string, string> = {
    nvm: 'Never married',
    div: 'Divorced',
    wid: 'Widowed',
  }
  return statusMap[status.toLowerCase()] || status
}

// Format body type
const formatBodyType = (type?: string): string => {
  if (!type) return ''
  const typeMap: Record<string, string> = {
    ave1: 'Average',
    slim: 'Slim',
    athl: 'Athletic',
  }
  return typeMap[type.toLowerCase()] || type
}

// Format family status
const formatFamilyStatus = (status?: string): string => {
  if (!status) return ''
  const statusMap: Record<string, string> = {
    middle: 'Middle Class',
    rich: 'Rich/Affluent',
    upper: 'Upper Middle Class',
  }
  return statusMap[status.toLowerCase()] || status
}

// Format family type
const formatFamilyType = (type?: string): string => {
  if (!type) return ''
  const typeMap: Record<string, string> = {
    nuclear: 'Nuclear Family',
    joint: 'Joint Family',
  }
  return typeMap[type.toLowerCase()] || type
}

// Format family values
const formatFamilyValues = (values?: string): string => {
  if (!values) return ''
  const valuesMap: Record<string, string> = {
    mod: 'Moderate',
    orth: 'Orthodox',
    cons: 'Conservative',
    lib: 'Liberal',
  }
  return valuesMap[values.toLowerCase()] || values
}

// Format employment
const formatEmployment = (emp?: string): string => {
  if (!emp) return ''
  const empMap: Record<string, string> = {
    gvtpbcsct: 'Government/Public Sector',
    priv: 'Private Sector',
    bus: 'Business',
  }
  return empMap[emp.toLowerCase()] || emp
}

// Format dietary habits
const formatDietaryHabits = (habits?: string): string => {
  if (!habits) return ''
  const habitsMap: Record<string, string> = {
    vege0: 'Vegetarian',
    nonv: 'Non-Vegetarian',
    egge: 'Eggetarian',
  }
  return habitsMap[habits.toLowerCase()] || habits
}

// Format drinking/smoking habits
const formatHabits = (habits?: string): string => {
  if (!habits) return ''
  const habitsMap: Record<string, string> = {
    no1: 'No',
    yes: 'Yes',
    occ: 'Occasionally',
  }
  return habitsMap[habits.toLowerCase()] || habits
}

// Format manglik
const formatManglik = (manglik?: string): string => {
  if (!manglik) return ''
  const manglikMap: Record<string, string> = {
    man: 'Manglik',
    non: 'Non-Manglik',
    ansh: 'Anshik (Partial Manglik)',
  }
  return manglikMap[manglik.toLowerCase()] || manglik
}

// Format managed by
const formatManagedBy = (managed?: string): string => {
  if (!managed) return ''
  const managedMap: Record<string, string> = {
    fami0: 'Family',
    self: 'Self',
  }
  return managedMap[managed.toLowerCase()] || managed
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

// Format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch {
    return dateString
  }
}

// Format time of birth
const formatTimeOfBirth = (tob?: string): string => {
  if (!tob) return ''
  try {
    const date = new Date(tob)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return tob
  }
}

// Income mapping
const incomeMap: Record<number, string> = {
  1: 'Rs. 0 - 1 Lakh',
  2: 'Rs. 1 - 2 Lakh',
  3: 'Rs. 3 - 4 Lakh',
  4: 'Rs. 4 - 5 Lakh',
  5: 'Rs. 5 - 6 Lakh',
  6: 'Rs. 5 - 7.5 Lakh',
  7: 'Rs. 7.5 - 10 Lakh',
  8: 'Rs. 10 - 15 Lakh',
  9: 'Rs. 15 - 20 Lakh',
  10: 'Rs. 20 - 25 Lakh',
  11: 'Rs. 25 - 30 Lakh',
  12: 'Rs. 30 - 40 Lakh',
  13: 'Rs. 40 - 50 Lakh',
  14: 'Rs. 50+ Lakh',
}

// Transform API data to display format
export const transformProfileDetail = (data: ProfileDetailData) => {
  const clientID = data.miscellaneous.clientID
  const allProfilePics = buildProfilePictures(data.miscellaneous.profilePic || [], clientID)
  const primaryPic = allProfilePics.find((pic) => pic.primary) || allProfilePics[0]

  const age = data.critical.dob ? calculateAge(data.critical.dob) : 0
  const profileId = `HEARTS-${data.miscellaneous.heartsId}`
  const location = formatLocation(data.miscellaneous.city, data.miscellaneous.state, data.miscellaneous.country)

  return {
    id: clientID,
    profileId,
    name: data.contact?.name || profileId,
    age,
    height: data.basic.height ? formatHeight(data.basic.height) : 'N/A',
    location,
    avatar: primaryPic?.url || null,
    verified: data.miscellaneous.isMembershipActive,
    isShortlisted: Boolean(data.miscellaneous.isShortlisted),
    isIgnored: Boolean((data.miscellaneous as { isIgnored?: boolean })?.isIgnored),

    // Basic details
    dateOfBirth: formatDate(data.critical.dob),
    maritalStatus: formatMaritalStatus(data.critical.maritalStatus),
    caste: data.basic.cast || '',
    aboutMe: data.about.description || '',
    profileManagedBy: formatManagedBy(data.about.managedBy),
    bodyType: formatBodyType(data.about.bodyType),
    thalassemia: data.about.thalassemia === 'no3' ? 'No' : data.about.thalassemia || 'N/A',
    hivPositive: data.about.hivPositive === 'N' ? 'No' : data.about.hivPositive || 'N/A',

    // Education & career
    school: data.education.school || '',
    qualification: data.education.qualification || '',
    aboutCareer: data.career.aboutMyCareer || '',
    employedIn: formatEmployment(data.career.employed_in),
    occupation: data.career.occupation || '',
    organisationName: data.career.organisationName || '',
    interestedInSettlingAbroad: data.career.interestedInSettlingAbroad === 'N' ? 'No' : 'Yes',
    income: data.career.income ? (incomeMap[data.career.income] || `Rs. ${data.career.income} Lakh`) : 'Not specified',

    // Nested detail groups
    familyDetails: {
      familyStatus: formatFamilyStatus(data.family.familyStatus),
      familyType: formatFamilyType(data.family.familyType),
      familyValues: formatFamilyValues(data.family.familyValues),
      familyIncome: data.family.familyIncome
        ? incomeMap[data.family.familyIncome] || `Rs. ${data.family.familyIncome} Lakh`
        : undefined,
      fatherOccupation: data.family.fatherOccupation,
      motherOccupation: data.family.motherOccupation,
      brothers: data.family.brothers ? Number(data.family.brothers) : undefined,
      marriedBrothers: data.family.marriedBrothers ? Number(data.family.marriedBrothers) : undefined,
      sisters: data.family.sisters ? Number(data.family.sisters) : undefined,
      marriedSisters: data.family.marriedSisters ? Number(data.family.marriedSisters) : undefined,
      aboutMyFamily: data.family.aboutMyFamily,
      familyBasedOutOf: data.family.familyBasedOutOf,
      gothra: data.family.gothra,
      livingWithParents: data.family.livingWithParents,
    },

    kundaliDetails: {
      rashi: data.kundali.rashi,
      nakshatra: data.kundali.nakshatra,
      timeOfBirth: formatTimeOfBirth(data.kundali.tob),
      manglik: formatManglik(data.kundali.manglik),
      horoscope: data.kundali.horoscope,
    },

    lifestyleData: {
      dietaryHabits: formatDietaryHabits(data.lifeStyleData.dietaryHabits),
      drinkingHabits: formatHabits(data.lifeStyleData.drinkingHabits),
      smokingHabits: formatHabits(data.lifeStyleData.smokingHabits),
      languages: data.lifeStyleData.languages,
      hobbies: data.lifeStyleData.hobbies,
      interest: data.lifeStyleData.interest,
      sports: data.lifeStyleData.sports,
      cuisine: data.lifeStyleData.cuisine,
    },

    matchDetails: {
      matchPercentage: data.matchPercentage,
      matchData: data.matchData || [],
    },

    allProfilePics,
  }
}

