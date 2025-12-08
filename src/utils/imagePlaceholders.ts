const FEMALE_PLACEHOLDER = '/girl-placeholder-lazy.png'
const MALE_PLACEHOLDER = '/boy-planceholder-lazy.png'

const FEMALE_KEYWORDS = new Set(['female', 'f', 'woman', 'girl', 'bride'])
const MALE_KEYWORDS = new Set(['male', 'm', 'man', 'boy', 'groom'])

export const getGenderPlaceholder = (gender?: string | null): string => {
  if (!gender) return FEMALE_PLACEHOLDER
  const normalized = gender.trim().toLowerCase()
  if (MALE_KEYWORDS.has(normalized)) return MALE_PLACEHOLDER
  if (FEMALE_KEYWORDS.has(normalized)) return FEMALE_PLACEHOLDER
  return FEMALE_PLACEHOLDER
}

export const getFallbackImage = (src?: string | null, gender?: string | null): string => {
  if (src && src.trim().length > 0) return src
  return getGenderPlaceholder(gender)
}









