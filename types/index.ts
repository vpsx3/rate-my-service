export type Vocation = 'EK' | 'RP' | 'ED' | 'MS' | 'None'
export type PriceModel = 'hourly' | 'per_session' | 'per_level' | 'negotiable'
export type Currency = 'gold' | 'BRL' | 'USD'
export type ServiceType = 'hunt' | 'powerlevel' | 'duo' | 'healer' | 'tanker' | 'boss' | 'task' | 'rookgaard' | 'other'
export type Tier = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond'

export interface Profile {
  id: string
  character_name: string
  server: string
  vocation: Vocation | null
  role: string[]
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface ServicerProfile {
  id: string
  service_types: ServiceType[] | null
  price_model: PriceModel | null
  price_min: number | null
  price_max: number | null
  currency: Currency
  availability: string | null
  rules: string | null
  is_available: boolean
  updated_at: string
}

export interface Review {
  id: string
  from_user_id: string
  to_user_id: string
  rating: number
  service_type: string | null
  body: string | null
  verified: boolean
  created_at: string
  from_profile?: Profile
}

export interface Vouch {
  id: string
  from_user_id: string
  to_user_id: string
  body: string
  created_at: string
  from_profile?: Profile
}

export interface ServicerWithProfile {
  profile: Profile
  servicer_profile: ServicerProfile
  avg_rating: number
  review_count: number
  verified_review_count: number
  tier: Tier
}

export function calculateTier(verifiedReviews: number, avgRating: number): Tier {
  if (verifiedReviews >= 30 && avgRating >= 4.8) return 'diamond'
  if (verifiedReviews >= 15 && avgRating >= 4.5) return 'gold'
  if (verifiedReviews >= 5 && avgRating >= 4.0) return 'silver'
  if (verifiedReviews >= 1) return 'bronze'
  return 'none'
}

export const TIER_CONFIG: Record<Tier, { label: string; emoji: string; color: string }> = {
  none: { label: 'Unranked', emoji: '', color: 'text-gray-400' },
  bronze: { label: 'Bronze', emoji: '🥉', color: 'text-amber-700' },
  silver: { label: 'Silver', emoji: '🥈', color: 'text-slate-400' },
  gold: { label: 'Gold', emoji: '🥇', color: 'text-yellow-500' },
  diamond: { label: 'Diamond', emoji: '💎', color: 'text-cyan-400' },
}

export const TIBIA_SERVERS = [
  'Antica', 'Quintera', 'Secura', 'Bona', 'Talera', 'Lobera',
  'Calmera', 'Gladera', 'Harmonia', 'Vunira', 'Pacera', 'Honbria',
  'Astera', 'Bastia', 'Calvera', 'Damora', 'Descubra', 'Epoca',
  'Estela', 'Ferobra', 'Firmera', 'Funera', 'Garnera', 'Gentebra',
  'Gravitera', 'Helesta', 'Hiberna', 'Inabra', 'Kalibra', 'Luminera',
  'Magera', 'Marcia', 'Menera', 'Mitigera', 'Mortera', 'Mykera',
  'Nadora', 'Nebula', 'Nefera', 'Obsidia', 'Olera', 'Optera',
  'Refugia', 'Relembra', 'Serdebra', 'Solera', 'Tenebra', 'Torpera',
  'Urdana', 'Utobra', 'Venebra', 'Vistalera', 'Vita', 'Wizera',
  'Xylana', 'Yonabra', 'Zuna',
]

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'hunt', label: 'Hunt' },
  { value: 'powerlevel', label: 'Powerlevel' },
  { value: 'duo', label: 'Duo Hunt' },
  { value: 'healer', label: 'Healer' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'boss', label: 'Boss' },
  { value: 'task', label: 'Task' },
  { value: 'rookgaard', label: 'Rookgaard' },
  { value: 'other', label: 'Other' },
]

export const VOCATIONS: { value: Vocation; label: string }[] = [
  { value: 'EK', label: 'Elite Knight' },
  { value: 'RP', label: 'Royal Paladin' },
  { value: 'ED', label: 'Elder Druid' },
  { value: 'MS', label: 'Master Sorcerer' },
  { value: 'None', label: 'None / Rooker' },
]
