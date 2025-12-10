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
    motherTongue?: string
    religion?: string
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
    height?: string
    state?: string
    city?: string
    country?: string
    motherTongue?: string
    religion?: string
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
    income?: string
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
    languages?: string | string[] // Can be comma-separated string or array
    foodICook?: string
    hobbies?: string | string[] // Can be comma-separated string or array
    interest?: string | string[] // Can be comma-separated string or array
    books?: string | string[] // Can be comma-separated string or array
    dress?: string | string[] // Can be comma-separated string or array
    sports?: string | string[] // Can be comma-separated string or array
    cuisine?: string | string[] // Can be comma-separated string or array
    favRead?: string
    favTVShow?: string
    vacayDestination?: string
    dietaryHabits?: string
    drinkingHabits?: string
    smokingHabits?: string
    openToPets?: string
    ownAHouse?: string
    ownACar?: string
    favMusic?: string | string[] // Can be comma-separated string or array
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

