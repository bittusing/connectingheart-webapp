// Extended profile data for profile view page
export type ProfileViewData = {
  id: string
  profileId: string // e.g., "HEARTS-14407157"
  name: string
  age: number
  height: string
  location: string
  avatar?: string | null
  verified?: boolean

  // Basic Details
  dateOfBirth?: string
  maritalStatus?: string
  caste?: string
  aboutMe?: string
  profileManagedBy?: string
  bodyType?: string
  thalassemia?: string
  hivPositive?: string

  // Educational Details
  school?: string
  qualification?: string

  // Career Details
  aboutCareer?: string
  employedIn?: string
  occupation?: string
  organisationName?: string
  interestedInSettlingAbroad?: string
  income?: string

  // Family Details
  familyDetails?: {
    familyStatus?: string
    familyType?: string
    familyValues?: string
    fatherOccupation?: string
    motherOccupation?: string
    brothers?: number
    sisters?: number
    marriedSisters?: number
    marriedBrothers?: number
    aboutMyFamily?: string
    familyIncome?: string
    familyBasedOutOf?: string
    gothra?: string
    livingWithParents?: string
  }

  // Kundali Details
  kundaliDetails?: {
    horoscope?: string
    manglik?: string
    rashi?: string
    nakshatra?: string
    timeOfBirth?: string
  }

  // Match Details
  matchDetails?: {
    matchPercentage?: string
    matchData?: Array<{
      label: string
      isMatched: boolean
      value: string
    }>
  }
  // Lifestyle Data
  lifestyleData?: {
    dietaryHabits?: string
    drinkingHabits?: string
    smokingHabits?: string
    languages?: string[]
    hobbies?: string[]
    interest?: string[]
    sports?: string[]
    cuisine?: string[]
  }
  // All profile pictures for carousel
  allProfilePics?: Array<{
    id: string
    url: string
    primary: boolean
  }>
  isShortlisted?: boolean
  isIgnored?: boolean
  isUnlocked?: boolean
  contactDetails?: {
    phoneNumber?: string
    email?: string
    name?: string
  }
}