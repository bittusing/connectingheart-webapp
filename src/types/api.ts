// API Response types
export type ApiProfileResponse = {
  code: string
  status: string
  message: string
  filteredProfiles?: ApiProfile[]
  shortlistedProfilesData?: ApiProfile[]
  ignoreListData?: ApiProfile[]
  notificationCount?: number
}

export type ApiProfile = {
  clientID?: string
  city?: string
  country?: string
  dob?: string
  height?: number // in inches
  state?: string
  income?: number // income level code
  cast?: string
  heartsId?: number
  gender?: string
  profilePic?: Array<{
    s3Link: string
    id: string
    primary: boolean
    _id: string
  }>
  isMembershipActive?: boolean
  isShortlisted?: boolean
}

export type LookupOption<TValue = string> = {
  label: string
  value: TValue
} & Record<string, unknown>

export type LookupDictionary = Record<string, LookupOption[]>

export type LookupResponse = {
  code: string
  status: string
  message: string
  lookupData: LookupDictionary[]
}

export type RangeFilterPayload = {
  min?: number
  max?: number
}

export type ProfileSearchPayload = {
  profileId?: string
  country?: string[]
  state?: string[]
  city?: string[]
  religion?: string[]
  motherTongue?: string[]
  maritalStatus?: string[]
  income?: RangeFilterPayload
  height?: RangeFilterPayload
  age?: RangeFilterPayload
}

