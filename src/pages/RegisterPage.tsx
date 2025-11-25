import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { MultiStepProgress } from '../components/forms/MultiStepProgress'
import { OtpModal } from '../components/forms/OtpModal'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
import {
  ageOptions,
  casteOptions,
  cityOptions,
  countryOptions,
  educationOptions,
  familyBasedOptions,
  familyStatusOptions,
  familyTypeOptions,
  familyValuesOptions,
  heightOptions,
  horoscopeOptions,
  incomeOptions,
  livingStatusOptions,
  manglikOptions,
  motherTongueOptions,
  occupationOptions,
  parentOccupationOptions,
  partnerManglikOptions,
  religionOptions,
  residenceOptions,
  stateOptions,
} from '../data/registerOptions'

const steps = [
  { id: 1, title: 'Sign up', subtitle: 'Fill in your basic details.' },
  { id: 2, title: 'Personal details', subtitle: 'Tell us more about you.' },
  { id: 3, title: 'Career details', subtitle: 'Share education & work info.' },
  { id: 4, title: 'Social details', subtitle: 'Cultural preferences.' },
  { id: 5, title: 'SRCM / Heartfulness', subtitle: 'Upload SRCM proof.' },
  { id: 6, title: 'Family details', subtitle: 'Tell us about your family.' },
  { id: 7, title: 'Partner preferences', subtitle: 'Who are you looking for?' },
  { id: 8, title: 'About you', subtitle: 'Profile pic & bio.' },
]

type PickerField =
  | 'country'
  | 'state'
  | 'city'
  | 'residence'
  | 'height'
  | 'education'
  | 'occupation'
  | 'income'
  | 'motherTongue'
  | 'caste'
  | 'horoscope'
  | 'manglik'
  | 'familyIncome'
  | 'familyLiving'
  | 'familyBase'
  | 'partnerMinHeight'
  | 'partnerMaxHeight'
  | 'partnerMinIncome'
  | 'partnerMaxIncome'
  | 'partnerCountry'
  | 'partnerResidence'
  | 'partnerOccupation'
  | 'partnerMotherTongue'
  | 'partnerCaste'
  | 'partnerEducation'
  | 'partnerHoroscope'

const pickerMap: Record<
  PickerField,
  { title: string; options: string[]; searchable?: boolean }
> = {
  country: { title: 'Select Country', options: countryOptions },
  state: { title: 'Select State', options: stateOptions },
  city: { title: 'Select City', options: cityOptions },
  residence: { title: 'Select Residential Status', options: residenceOptions },
  height: { title: 'Select Height', options: heightOptions },
  education: { title: 'Select Education Qualification', options: educationOptions },
  occupation: { title: 'Select Occupation', options: occupationOptions },
  income: { title: 'Enter your Income', options: incomeOptions },
  motherTongue: { title: 'Select Mother Tongue', options: motherTongueOptions },
  caste: { title: 'Select Caste', options: casteOptions },
  horoscope: { title: 'Select Horoscope', options: horoscopeOptions },
  manglik: { title: 'Select Manglik', options: manglikOptions },
  familyIncome: { title: 'Select Family Income', options: incomeOptions },
  familyLiving: { title: 'I am living with parents', options: livingStatusOptions },
  familyBase: { title: 'My family based out of', options: familyBasedOptions },
  partnerMinHeight: { title: 'Select Min Height', options: heightOptions },
  partnerMaxHeight: { title: 'Select Max Height', options: heightOptions },
  partnerMinIncome: { title: 'Select Min Income', options: incomeOptions },
  partnerMaxIncome: { title: 'Select Max Income', options: incomeOptions },
  partnerCountry: { title: 'Select Country', options: countryOptions },
  partnerResidence: { title: 'Select Residential Status', options: residenceOptions },
  partnerOccupation: { title: 'Select Occupation', options: occupationOptions },
  partnerMotherTongue: { title: 'Select Mother Tongue', options: motherTongueOptions },
  partnerCaste: { title: 'Select Caste', options: casteOptions },
  partnerEducation: { title: 'Select Education', options: educationOptions },
  partnerHoroscope: { title: 'Select Horoscope', options: horoscopeOptions },
}

const ToggleGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${
            value === option
              ? 'border-pink-500 bg-pink-50 text-pink-600'
              : 'border-slate-200 text-slate-500'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
)

const MultiSelectChips = ({
  label,
  options,
  values,
  onToggle,
}: {
  label: string
  options: string[]
  values: string[]
  onToggle: (value: string) => void
}) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const active = values.includes(option)
        return (
          <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              active
                ? 'border-pink-500 bg-pink-50 text-pink-600'
                : 'border-slate-200 text-slate-500'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>
)

const SelectButton = ({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string
  value?: string
  placeholder: string
  onClick: () => void
}) => (
  <label className="space-y-2 text-left">
    <span className="block text-sm font-medium text-slate-700">{label}</span>
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
      onClick={onClick}
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span className="text-slate-400">{placeholder}</span>
      )}
      <span className="text-slate-300">⌄</span>
    </button>
  </label>
)

const CountSelector = ({
  label,
  value,
  max = 4,
  onChange,
}: {
  label: string
  value: number
  max?: number
  onChange: (value: number) => void
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max + 1 }, (_, index) => index).map((count) => (
        <button
          type="button"
          key={count}
          onClick={() => onChange(count)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            value === count
              ? 'bg-pink-500 text-white'
              : 'border border-slate-200 text-slate-500'
          }`}
        >
          {count === 0 ? 'None' : count}
        </button>
      ))}
    </div>
  </div>
)

const UploadDropzone = ({
  label,
  value,
  onClick,
}: {
  label: string
  value?: string
  onClick: () => void
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">{label}</p>
    <button
      type="button"
      onClick={onClick}
      className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
    >
      {value ? (
        <span className="font-semibold text-slate-900">{value}</span>
      ) : (
        <>
          <span className="text-2xl text-pink-500">＋</span>
          <span>Upload</span>
        </>
      )}
    </button>
  </div>
)

const CounterTextarea = ({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  maxLength: number
}) => (
  <label className="space-y-2">
    <span className="block text-sm font-medium text-slate-700">{label}</span>
    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
      placeholder="Tell us about yourself"
    />
    <span className="block text-right text-xs text-slate-400">
      {value.length} / {maxLength}
    </span>
  </label>
)

const FileUploadModal = ({
  open,
  title,
  onClose,
  onUpload,
}: {
  open: boolean
  title: string
  onClose: () => void
  onUpload: (fileName: string) => void
}) => {
  const [fileName, setFileName] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <input
          type="file"
          className="mt-4 w-full text-sm"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
        />
        <Button
          className="mt-4 w-full"
          disabled={!fileName}
          onClick={() => {
            if (fileName) {
              onUpload(fileName)
              setFileName('')
            }
          }}
        >
          Upload image
        </Button>
        <button
          type="button"
          className="mt-3 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
          onClick={() => {
            setFileName('')
            onClose()
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const ConfirmationModal = ({
  open,
  onBack,
  onConfirm,
}: {
  open: boolean
  onBack: () => void
  onConfirm: () => void
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h3 className="text-xl font-semibold text-slate-900">Data submitted cannot be changed</h3>
        <p className="mt-2 text-sm text-slate-500">
          Please ensure everything is correct before continuing.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back to edit
          </Button>
          <Button className="w-full" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [activePicker, setActivePicker] = useState<PickerField | null>(null)
  const [uploadModal, setUploadModal] = useState<null | 'srcm' | 'profile'>(null)
  const [otpVerified, setOtpVerified] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)

  const [basic, setBasic] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const [personal, setPersonal] = useState({
    gender: 'Female',
    dob: '',
    height: '',
    country: '',
    state: '',
    city: '',
    residence: '',
  })

  const [career, setCareer] = useState({
    education: '',
    otherDegree: '',
    employedIn: 'Private Sector',
    occupation: '',
    income: '',
  })

  const [social, setSocial] = useState({
    maritalStatus: 'Never married',
    religion: 'Hindu',
    motherTongue: '',
    casteNoBar: false,
    caste: '',
    horoscope: '',
    manglik: '',
  })

  const [srcm, setSrcm] = useState({
    upload: '',
    idNumber: '',
    center: '',
    preceptorName: '',
    preceptorMobile: '',
    preceptorEmail: '',
  })

  const [family, setFamily] = useState({
    status: 'Middle Class',
    values: 'Moderate',
    type: 'Joint Family',
    income: '',
    fatherOccupation: 'Service - Private',
    motherOccupation: 'Housewife',
    brothers: 0,
    sisters: 0,
    marriedSisters: 0,
    gothra: '',
    living: '',
    familyBase: '',
  })

  const [partner, setPartner] = useState({
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    minIncome: '',
    maxIncome: '',
    country: '',
    residence: '',
    occupation: '',
    religions: ['Hindu'],
    maritalStatus: ['Never married'],
    motherTongue: '',
    caste: '',
    education: '',
    horoscope: '',
    manglik: '',
  })

  const [about, setAbout] = useState({
    profilePic: '',
    bio: '',
  })

  const pickerValue = useMemo(() => {
    if (!activePicker) return ''
    const map: Record<PickerField, string> = {
      country: personal.country,
      state: personal.state,
      city: personal.city,
      residence: personal.residence,
      height: personal.height,
      education: career.education,
      occupation: career.occupation,
      income: career.income,
      motherTongue: social.motherTongue,
      caste: social.caste,
      horoscope: social.horoscope,
      manglik: social.manglik,
      familyIncome: family.income,
      familyLiving: family.living,
      familyBase: family.familyBase,
      partnerMinHeight: partner.minHeight,
      partnerMaxHeight: partner.maxHeight,
      partnerMinIncome: partner.minIncome,
      partnerMaxIncome: partner.maxIncome,
      partnerCountry: partner.country,
      partnerResidence: partner.residence,
      partnerOccupation: partner.occupation,
      partnerMotherTongue: partner.motherTongue,
      partnerCaste: partner.caste,
      partnerEducation: partner.education,
      partnerHoroscope: partner.horoscope,
    }
    return map[activePicker]
  }, [activePicker, career, family, partner, personal, social])

  const setPickerValue = (value: string) => {
    if (!activePicker) return
    switch (activePicker) {
      case 'country':
        setPersonal((prev) => ({ ...prev, country: value }))
        break
      case 'state':
        setPersonal((prev) => ({ ...prev, state: value }))
        break
      case 'city':
        setPersonal((prev) => ({ ...prev, city: value }))
        break
      case 'residence':
        setPersonal((prev) => ({ ...prev, residence: value }))
        break
      case 'height':
        setPersonal((prev) => ({ ...prev, height: value }))
        break
      case 'education':
        setCareer((prev) => ({ ...prev, education: value }))
        break
      case 'occupation':
        setCareer((prev) => ({ ...prev, occupation: value }))
        break
      case 'income':
        setCareer((prev) => ({ ...prev, income: value }))
        break
      case 'motherTongue':
        setSocial((prev) => ({ ...prev, motherTongue: value }))
        break
      case 'caste':
        setSocial((prev) => ({ ...prev, caste: value }))
        break
      case 'horoscope':
        setSocial((prev) => ({ ...prev, horoscope: value }))
        break
      case 'manglik':
        setSocial((prev) => ({ ...prev, manglik: value }))
        break
      case 'familyIncome':
        setFamily((prev) => ({ ...prev, income: value }))
        break
      case 'familyLiving':
        setFamily((prev) => ({ ...prev, living: value }))
        break
      case 'familyBase':
        setFamily((prev) => ({ ...prev, familyBase: value }))
        break
      case 'partnerMinHeight':
        setPartner((prev) => ({ ...prev, minHeight: value }))
        break
      case 'partnerMaxHeight':
        setPartner((prev) => ({ ...prev, maxHeight: value }))
        break
      case 'partnerMinIncome':
        setPartner((prev) => ({ ...prev, minIncome: value }))
        break
      case 'partnerMaxIncome':
        setPartner((prev) => ({ ...prev, maxIncome: value }))
        break
      case 'partnerCountry':
        setPartner((prev) => ({ ...prev, country: value }))
        break
      case 'partnerResidence':
        setPartner((prev) => ({ ...prev, residence: value }))
        break
      case 'partnerOccupation':
        setPartner((prev) => ({ ...prev, occupation: value }))
        break
      case 'partnerMotherTongue':
        setPartner((prev) => ({ ...prev, motherTongue: value }))
        break
      case 'partnerCaste':
        setPartner((prev) => ({ ...prev, caste: value }))
        break
      case 'partnerEducation':
        setPartner((prev) => ({ ...prev, education: value }))
        break
      case 'partnerHoroscope':
        setPartner((prev) => ({ ...prev, horoscope: value }))
        break
      default:
        break
    }
  }

  const handleBasicSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!basic.agree) return
    setOtpModalOpen(true)
  }

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length))
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  const renderStep = () => {
    if (step === 1) {
      return (
        <form className="space-y-4" onSubmit={handleBasicSubmit}>
          <TextInput
            label="Full Name"
            required
            placeholder="Enter full name"
            value={basic.fullName}
            onChange={(event) => setBasic((prev) => ({ ...prev, fullName: event.target.value }))}
          />
          <TextInput
            label="Email"
            type="email"
            required
            placeholder="Enter email"
            value={basic.email}
            onChange={(event) => setBasic((prev) => ({ ...prev, email: event.target.value }))}
          />
          <TextInput
            label="Mobile Number"
            type="tel"
            required
            placeholder="+91 90000 00000"
            value={basic.phone}
            onChange={(event) => setBasic((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <TextInput
            label="Password"
            type="password"
            required
            placeholder="Enter password"
            value={basic.password}
            onChange={(event) => setBasic((prev) => ({ ...prev, password: event.target.value }))}
          />
          <TextInput
            label="Confirm Password"
            type="password"
            required
            placeholder="Confirm your password"
            value={basic.confirmPassword}
            onChange={(event) =>
              setBasic((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={basic.agree}
              onChange={(event) =>
                setBasic((prev) => ({ ...prev, agree: event.target.checked }))
              }
            />
            I agree to terms and conditions
          </label>
          <Button type="submit" size="lg" fullWidth>
            Register now
          </Button>
          <button
            type="button"
            onClick={handleBack}
            className="text-sm font-semibold text-pink-600"
          >
            ◀ Back
          </button>
        </form>
      )
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <ToggleGroup
            label="Gender"
            value={personal.gender}
            options={['Male', 'Female']}
            onChange={(value) => setPersonal((prev) => ({ ...prev, gender: value }))}
          />
          <TextInput
            label="Date of Birth"
            type="date"
            value={personal.dob}
            onChange={(event) =>
              setPersonal((prev) => ({
                ...prev,
                dob: event.target.value,
              }))
            }
            required
          />
          <SelectButton
            label="Height"
            value={personal.height}
            placeholder="Select height"
            onClick={() => setActivePicker('height')}
          />
          <SelectButton
            label="Country"
            value={personal.country}
            placeholder="Select country"
            onClick={() => setActivePicker('country')}
          />
          <SelectButton
            label="State"
            value={personal.state}
            placeholder="Select state"
            onClick={() => setActivePicker('state')}
          />
          <SelectButton
            label="City"
            value={personal.city}
            placeholder="Select city"
            onClick={() => setActivePicker('city')}
          />
          <SelectButton
            label="Residential Status"
            value={personal.residence}
            placeholder="Select residential status"
            onClick={() => setActivePicker('residence')}
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    }

    if (step === 3) {
      return (
        <div className="space-y-5">
          <SelectButton
            label="Education"
            value={career.education}
            placeholder="Select education"
            onClick={() => setActivePicker('education')}
          />
          <TextInput
            label="Other UG Degree"
            placeholder="Enter degree name"
            value={career.otherDegree}
            onChange={(event) =>
              setCareer((prev) => ({ ...prev, otherDegree: event.target.value }))
            }
          />
          <ToggleGroup
            label="Employed in"
            value={career.employedIn}
            options={[
              'Private Sector',
              'Government/Public Sector',
              'Civil Services',
              'Defence',
              'Business/Self Employed',
              'Not Working',
            ]}
            onChange={(value) => setCareer((prev) => ({ ...prev, employedIn: value }))}
          />
          <SelectButton
            label="Occupation"
            value={career.occupation}
            placeholder="Select occupation"
            onClick={() => setActivePicker('occupation')}
          />
          <SelectButton
            label="Income"
            value={career.income}
            placeholder="Enter your income"
            onClick={() => setActivePicker('income')}
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    }

    if (step === 4) {
      return (
        <div className="space-y-5">
          <ToggleGroup
            label="Marital Status"
            value={social.maritalStatus}
            options={['Annulled', 'Never married', 'Widowed', 'Divorced', 'Pending divorce']}
            onChange={(value) =>
              setSocial((prev) => ({
                ...prev,
                maritalStatus: value,
              }))
            }
          />
          <SelectButton
            label="Mother tongue"
            value={social.motherTongue}
            placeholder="Select mother tongue"
            onClick={() => setActivePicker('motherTongue')}
          />
          <ToggleGroup
            label="Religion"
            value={social.religion}
            options={religionOptions}
            onChange={(value) => setSocial((prev) => ({ ...prev, religion: value }))}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={social.casteNoBar}
              onChange={(event) =>
                setSocial((prev) => ({ ...prev, casteNoBar: event.target.checked }))
              }
            />
            I am open to marry people of any caste
          </label>
          <SelectButton
            label="Caste"
            value={social.caste}
            placeholder="Select caste"
            onClick={() => setActivePicker('caste')}
          />
          <SelectButton
            label="Horoscope"
            value={social.horoscope}
            placeholder="Select horoscope"
            onClick={() => setActivePicker('horoscope')}
          />
          <SelectButton
            label="Manglik"
            value={social.manglik}
            placeholder="Select"
            onClick={() => setActivePicker('manglik')}
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    }

    if (step === 5) {
      return (
        <div className="space-y-5">
          <UploadDropzone
            label="SRCM ID"
            value={srcm.upload}
            onClick={() => setUploadModal('srcm')}
          />
          <TextInput
            label="SRCM/Heartfulness ID Number"
            value={srcm.idNumber}
            onChange={(event) =>
              setSrcm((prev) => ({
                ...prev,
                idNumber: event.target.value,
              }))
            }
          />
          <TextInput
            label="Satsang center name/city"
            value={srcm.center}
            onChange={(event) =>
              setSrcm((prev) => ({
                ...prev,
                center: event.target.value,
              }))
            }
          />
          <TextInput
            label="Preceptor's Name (frequently visited)"
            value={srcm.preceptorName}
            onChange={(event) =>
              setSrcm((prev) => ({
                ...prev,
                preceptorName: event.target.value,
              }))
            }
          />
          <TextInput
            label="Preceptor's Mobile Number"
            value={srcm.preceptorMobile}
            onChange={(event) =>
              setSrcm((prev) => ({
                ...prev,
                preceptorMobile: event.target.value,
              }))
            }
          />
          <TextInput
            label="Preceptor's Email"
            type="email"
            value={srcm.preceptorEmail}
            onChange={(event) =>
              setSrcm((prev) => ({
                ...prev,
                preceptorEmail: event.target.value,
              }))
            }
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={() => setConfirmationOpen(true)}>Next</Button>
          </div>
        </div>
      )
    }

    if (step === 6) {
      return (
        <div className="space-y-5">
          <ToggleGroup
            label="Family Status"
            value={family.status}
            options={familyStatusOptions}
            onChange={(value) => setFamily((prev) => ({ ...prev, status: value }))}
          />
          <ToggleGroup
            label="Family Values"
            value={family.values}
            options={familyValuesOptions}
            onChange={(value) => setFamily((prev) => ({ ...prev, values: value }))}
          />
          <ToggleGroup
            label="Family Type"
            value={family.type}
            options={familyTypeOptions}
            onChange={(value) => setFamily((prev) => ({ ...prev, type: value }))}
          />
          <SelectButton
            label="Family Income"
            value={family.income}
            placeholder="Select family income"
            onClick={() => setActivePicker('familyIncome')}
          />
          <ToggleGroup
            label="Father Occupation"
            value={family.fatherOccupation}
            options={parentOccupationOptions}
            onChange={(value) => setFamily((prev) => ({ ...prev, fatherOccupation: value }))}
          />
          <ToggleGroup
            label="Mother Occupation"
            value={family.motherOccupation}
            options={parentOccupationOptions}
            onChange={(value) => setFamily((prev) => ({ ...prev, motherOccupation: value }))}
          />
          <CountSelector
            label="Brother(s)"
            value={family.brothers}
            onChange={(value) => setFamily((prev) => ({ ...prev, brothers: value }))}
          />
          <CountSelector
            label="Sister(s)"
            value={family.sisters}
            onChange={(value) => setFamily((prev) => ({ ...prev, sisters: value }))}
          />
          <CountSelector
            label="Married sister(s)"
            value={family.marriedSisters}
            onChange={(value) => setFamily((prev) => ({ ...prev, marriedSisters: value }))}
          />
          <TextInput
            label="Gothra"
            value={family.gothra}
            onChange={(event) =>
              setFamily((prev) => ({
                ...prev,
                gothra: event.target.value,
              }))
            }
          />
          <SelectButton
            label="I am living with parents"
            value={family.living}
            placeholder="Select"
            onClick={() => setActivePicker('familyLiving')}
          />
          <SelectButton
            label="My family based out of"
            value={family.familyBase}
            placeholder="Select"
            onClick={() => setActivePicker('familyBase')}
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    }

    if (step === 7) {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Min Age
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={partner.minAge}
                onChange={(event) => setPartner((prev) => ({ ...prev, minAge: event.target.value }))}
              >
                <option value="">Select min age</option>
                {ageOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Max Age
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={partner.maxAge}
                onChange={(event) => setPartner((prev) => ({ ...prev, maxAge: event.target.value }))}
              >
                <option value="">Select max age</option>
                {ageOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectButton
              label="Min height"
              value={partner.minHeight}
              placeholder="Select min height"
              onClick={() => setActivePicker('partnerMinHeight')}
            />
            <SelectButton
              label="Max height"
              value={partner.maxHeight}
              placeholder="Select max height"
              onClick={() => setActivePicker('partnerMaxHeight')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectButton
              label="Min income"
              value={partner.minIncome}
              placeholder="Select min income"
              onClick={() => setActivePicker('partnerMinIncome')}
            />
            <SelectButton
              label="Max income"
              value={partner.maxIncome}
              placeholder="Select max income"
              onClick={() => setActivePicker('partnerMaxIncome')}
            />
          </div>
          <SelectButton
            label="Country"
            value={partner.country}
            placeholder="Select country"
            onClick={() => setActivePicker('partnerCountry')}
          />
          <SelectButton
            label="Residential status"
            value={partner.residence}
            placeholder="Select residential status"
            onClick={() => setActivePicker('partnerResidence')}
          />
          <SelectButton
            label="Occupation"
            value={partner.occupation}
            placeholder="Select occupation"
            onClick={() => setActivePicker('partnerOccupation')}
          />
          <MultiSelectChips
            label="Religion"
            options={religionOptions}
            values={partner.religions}
            onToggle={(option) =>
              setPartner((prev) => ({
                ...prev,
                religions: prev.religions.includes(option)
                  ? prev.religions.filter((item) => item !== option)
                  : [...prev.religions, option],
              }))
            }
          />
          <MultiSelectChips
            label="Marital status"
            options={['Annulled', 'Never married', 'Widowed', 'Divorced', 'Pending divorce']}
            values={partner.maritalStatus}
            onToggle={(option) =>
              setPartner((prev) => ({
                ...prev,
                maritalStatus: prev.maritalStatus.includes(option)
                  ? prev.maritalStatus.filter((item) => item !== option)
                  : [...prev.maritalStatus, option],
              }))
            }
          />
          <SelectButton
            label="Mother tongue"
            value={partner.motherTongue}
            placeholder="Select mother tongue"
            onClick={() => setActivePicker('partnerMotherTongue')}
          />
          <SelectButton
            label="Caste"
            value={partner.caste}
            placeholder="Select caste"
            onClick={() => setActivePicker('partnerCaste')}
          />
          <SelectButton
            label="Education"
            value={partner.education}
            placeholder="Select education"
            onClick={() => setActivePicker('partnerEducation')}
          />
          <SelectButton
            label="Horoscope"
            value={partner.horoscope}
            placeholder="Select horoscope"
            onClick={() => setActivePicker('partnerHoroscope')}
          />
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Manglik preference</p>
            <div className="flex flex-wrap gap-3">
              {partnerManglikOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="partner-manglik"
                    checked={partner.manglik === option}
                    onChange={() => setPartner((prev) => ({ ...prev, manglik: option }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        <UploadDropzone
          label="Profile Pic"
          value={about.profilePic}
          onClick={() => setUploadModal('profile')}
        />
        <CounterTextarea
          label="Tell us about yourself"
          value={about.bio}
          maxLength={125}
          onChange={(value) => setAbout((prev) => ({ ...prev, bio: value }))}
        />
        <Button size="lg" onClick={() => navigate('/under-verification')}>
          Create my profile
        </Button>
        <button type="button" className="w-full text-sm font-semibold text-pink-600">
          I will fill this later
        </button>
        <Button variant="ghost" onClick={handleBack}>
          ◀ Back
        </Button>
      </div>
    )
  }

  return (
    <section className="section-shell">
      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className="hidden rounded-3xl bg-cover bg-center lg:block"
          style={{ backgroundImage: "url('/homeScreenPic.png')" }}
        />
        <div className="glass-panel space-y-8">
          <div className="text-right">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-pink-500">
                Log in
              </Link>
            </p>
          </div>
          <MultiStepProgress
            current={step}
            total={steps.length}
            label={`Step ${step} of ${steps.length}`}
          />
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-semibold text-slate-900">
              {steps[step - 1]?.title}
            </h1>
            <p className="text-sm text-slate-500">{steps[step - 1]?.subtitle}</p>
          </div>
          {renderStep()}
        </div>
      </div>
      <OtpModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={() => {
          setOtpModalOpen(false)
          setOtpVerified(true)
          setStep(2)
        }}
      />
      {activePicker && (
        <SelectModal
          isOpen
          title={pickerMap[activePicker].title}
          options={pickerMap[activePicker].options}
          searchable={pickerMap[activePicker].searchable}
          selected={pickerValue}
          onClose={() => setActivePicker(null)}
          onConfirm={(value) => {
            setPickerValue(value)
            setActivePicker(null)
          }}
        />
      )}
      <FileUploadModal
        open={uploadModal === 'srcm'}
        title="Upload SRCM ID"
        onClose={() => setUploadModal(null)}
        onUpload={(fileName) => {
          setSrcm((prev) => ({ ...prev, upload: fileName }))
          setUploadModal(null)
        }}
      />
      <FileUploadModal
        open={uploadModal === 'profile'}
        title="Upload profile picture"
        onClose={() => setUploadModal(null)}
        onUpload={(fileName) => {
          setAbout((prev) => ({ ...prev, profilePic: fileName }))
          setUploadModal(null)
        }}
      />
      <ConfirmationModal
        open={confirmationOpen}
        onBack={() => setConfirmationOpen(false)}
        onConfirm={() => {
          setConfirmationOpen(false)
          handleNext()
        }}
      />
      {!otpVerified && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Steps unlock after OTP verification. Previewing static flow now.
        </p>
      )}
    </section>
  )
}

