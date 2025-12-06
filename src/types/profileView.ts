// API Response types for profile detail view
export type ProfileDetailResponse = {
  code: string
  status: string
  data: ProfileDetailData
}

export type ProfileDetailData = {
  miscellaneous: {
    country: string
    state: string
    city: string
    heartsId: number
    gender?: string
    profilePic: Array<{
      s3Link: string
      id: string
      primary: boolean
      _id: string
    }>
    clientID: string
    isUnlocked: boolean
    isMembershipActive: boolean
    isShortlisted: boolean
    isIgnored?: boolean
  }
  basic: {
    cast?: string
    height?: number
    state?: string
  }
  critical: {
    dob?: string
    maritalStatus?: string
  }
  about: {
    managedBy?: string
    description?: string
    bodyType?: string
    thalassemia?: string
    hivPositive?: string
    disability?: string
  }
  education: {
    qualification?: string
    otherUGDegree?: string
    aboutEducation?: string
    school?: string
  }
  career: {
    aboutMyCareer?: string
    employed_in?: string
    occupation?: string
    organisationName?: string
    interestedInSettlingAbroad?: string
    income?: number
  }
  family: {
    familyStatus?: string
    familyValues?: string
    familyType?: string
    familyIncome?: number
    fatherOccupation?: string
    motherOccupation?: string
    brothers?: string
    marriedBrothers?: string
    sisters?: string
    marriedSisters?: string
    gothra?: string
    livingWithParents?: string
    familyBasedOutOf?: string
    aboutMyFamily?: string
  }
  contact: {
    phoneNumber?: string
    email?: string
    name?: string
    alternateEmail?: string
    altMobileNumber?: string
    landline?: string
  }
  kundali: {
    city?: string
    state?: string
    country?: string
    tob?: string
    manglik?: string
    horoscope?: string
    rashi?: string
    nakshatra?: string
  }
  lifeStyleData: {
    habits?: string
    assets?: string
    movies?: string
    languages?: string[]
    foodICook?: string
    hobbies?: string[]
    interest?: string[]
    books?: string[]
    dress?: string[]
    sports?: string[]
    cuisine?: string[]
    favRead?: string
    favTVShow?: string
    vacayDestination?: string
    dietaryHabits?: string
    drinkingHabits?: string
    smokingHabits?: string
    openToPets?: string
    ownAHouse?: string
    ownACar?: string
    favMusic?: string[]
  }
  matchData?: Array<{
    label: string
    isMatched: boolean
    value: string
  }>
  matchPercentage?: string
}

// User data response
export type UserDataResponse = {
  code: string
  status: string
  message: string
  data: {
    _id: string
    phoneNumber: string
    countryCode: string
    email: string
    name: string
    heartsId: number
    profilePic?: Array<{
      s3Link: string
      id: string
      primary: boolean
    }>
    gender: string
    isVerified: boolean
    planName?: string
    memberShipExpiryDate?: string | null
    membershipStartDate?: string | null
    shortlistedProfiles?: string[]
    unlockedProfiles?: string[]
    visitors?: string[]
  }
}

