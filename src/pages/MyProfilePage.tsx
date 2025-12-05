import { useNavigate } from 'react-router-dom'
import { PencilIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useUserProfile } from '../hooks/useUserProfile'
import { getGenderPlaceholder } from '../utils/imagePlaceholders'

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

export const MyProfilePage = () => {
  const navigate = useNavigate()
  const { profile, loading, error } = useMyProfileData()
  const { profile: userProfile } = useUserProfile()

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
  const primaryPic = profile.miscellaneous.profilePic?.find((pic) => pic.primary) || profile.miscellaneous.profilePic?.[0]
  const avatarUrl = primaryPic
    ? `https://backendapp.connectingheart.co.in/api/profile/file/${profile.miscellaneous.heartsId}/${primaryPic.id}`
    : null


  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <img
              src={avatarUrl || getGenderPlaceholder(profile.basic.name)}
              alt={profile.basic.name || 'Profile'}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-100 dark:ring-pink-900/30"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = getGenderPlaceholder(profile.basic.name)
              }}
            />
            <button
              onClick={() => navigate('/editprofile/basic')}
              className="absolute bottom-0 right-0 rounded-full bg-pink-500 p-2 text-white shadow-lg transition hover:bg-pink-600"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{profileId}</p>
              <button
                onClick={() => navigate('/dashboard/personaldetails')}
                className="rounded-lg bg-pink-50 p-1.5 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <button className="mt-4 flex items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 sm:inline-flex">
              <PhotoIcon className="h-4 w-4" />
              <span>+ Add More Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Profile Details</h2>
          <button
            onClick={() => navigate('/dashboard/personaldetails')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow label="Name" value={profile.basic.name || 'Not Filled'} />
          <DetailRow label="Gender" value={userProfile?.gender || 'Not Filled'} />
          <DetailRow label="Religion" value={enriched.religionLabel || 'Not Filled'} />
          <DetailRow label="Mother Tongue" value={enriched.motherTongueLabel || 'Not Filled'} />
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
          <h2 className="font-display text-xl font-semibold text-red-600 dark:text-red-400">Critical Field</h2>
          <button
            onClick={() => navigate('/dashboard/personaldetails')}
            className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="Date of Birth"
            value={profile.critical.dob ? formatDate(profile.critical.dob) : 'Not Filled'}
            isNotFilled={!profile.critical.dob}
          />
          <DetailRow
            label="Marital Status"
            value={formatMaritalStatus(profile.critical.maritalStatus) || 'Not Filled'}
            isNotFilled={!profile.critical.maritalStatus}
          />
        </div>
      </div>

      {/* About Me Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">About Me</h2>
          <button
            onClick={() => navigate('/dashboard/aboutyou')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="Tell us About YourSelf"
            value={profile.about.aboutYourself || 'Not Filled'}
            isNotFilled={!profile.about.aboutYourself}
          />
          <DetailRow label="Profile Managed By" value={enriched.managedByLabel || 'Not Filled'} />
          <DetailRow
            label="Disability"
            value={profile.about.disability || 'Not Filled'}
            isNotFilled={!profile.about.disability}
          />
          <DetailRow
            label="Body Type"
            value={profile.about.bodyType || 'Not Filled'}
            isNotFilled={!profile.about.bodyType}
          />
          <DetailRow
            label="Thalassemia"
            value={profile.about.thalassemia || 'Not Filled'}
            isNotFilled={!profile.about.thalassemia}
          />
          <DetailRow
            label="HIV Positive"
            value={profile.about.hivPositive || 'Not Filled'}
            isNotFilled={!profile.about.hivPositive}
          />
        </div>
      </div>

      {/* Education Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Education</h2>
          <button
            onClick={() => navigate('/dashboard/careerdetails')}
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
            onClick={() => navigate('/dashboard/careerdetails')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="About My Career"
            value={profile.career.aboutCareer || 'Not Filled'}
            isNotFilled={!profile.career.aboutCareer}
          />
          <DetailRow label="Employed In" value={enriched.employedInLabel || 'Not Filled'} />
          <DetailRow label="Occupation" value={enriched.occupationLabel || 'Not Filled'} />
          <DetailRow
            label="Organisation Name"
            value={profile.career.organisationName || 'Not Filled'}
            isNotFilled={!profile.career.organisationName}
          />
          <DetailRow
            label="Interested In Setting Abroad"
            value={profile.career.interestedInSettingAbroad || 'Not Filled'}
            isNotFilled={!profile.career.interestedInSettingAbroad}
          />
        </div>
      </div>

      {/* Family Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Family</h2>
          <button
            onClick={() => navigate('/dashboard/familydetails')}
            className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow
            label="About My Family"
            value={profile.family.aboutFamily || 'Not Filled'}
            isNotFilled={!profile.family.aboutFamily}
          />
          <DetailRow
            label="Family Status"
            value={profile.family.familyStatus || 'Not Filled'}
            isNotFilled={!profile.family.familyStatus}
          />
          <DetailRow
            label="Family Type"
            value={profile.family.familyType || 'Not Filled'}
            isNotFilled={!profile.family.familyType}
          />
          <DetailRow
            label="Family values"
            value={profile.family.familyValues || 'Not Filled'}
            isNotFilled={!profile.family.familyValues}
          />
          <DetailRow
            label="Family Income"
            value={profile.family.familyIncome ? incomeMap[profile.family.familyIncome] || String(profile.family.familyIncome) : 'Not Filled'}
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
            onClick={() => navigate('/dashboard/personaldetails')}
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
            value={profile.contact.alternateMobileNo || 'Not Filled'}
            isNotFilled={!profile.contact.alternateMobileNo}
          />
          <DetailRow
            label="Alternate Email Id"
            value={profile.contact.alternateEmailId || 'Not Filled'}
            isNotFilled={!profile.contact.alternateEmailId}
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
            onClick={() => navigate('/dashboard/srcmdetails')}
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
            value={profile.horoscope.placeOfBirth || 'Not Filled'}
            isNotFilled={!profile.horoscope.placeOfBirth}
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
            onClick={() => navigate('/dashboard/socialdetails')}
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
