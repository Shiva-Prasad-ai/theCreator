export type DataConfidence = 'estimated' | 'sample' | 'verified'
export type MatchTier = 'high' | 'mid' | 'least'
export type CallStatus =
  | 'not_contacted'
  | 'scheduled'
  | 'contacted'
  | 'in_discussion'
  | 'converted'
  | 'archived'

export interface Product {
  id: string
  user_id: string
  name: string
  industry: string | null
  icp: string | null
  description: string | null
  created_at: string
}

export interface ColdPitchDraft {
  subject: string
  opening_hook: string
  how_it_is_useful: string
  why_choose_us: string
  call_to_action: string
  full_body: string
}

export interface Company {
  id: string
  user_id?: string | null
  region: string
  company: string
  industry: string | null
  headcount: number | null
  lat: number | null
  lng: number | null
  data_confidence: DataConfidence
  created_at: string

  // Parameters: Name, Nature/Industries, Start Date
  start_date?: string | null
  description?: string | null
  contact_email?: string | null
  website?: string | null
  contact_person?: string | null
  contact_phone?: string | null
  approx_location?: string | null
  location_confidence?: 'exact' | 'approximate' | 'unverified'
  field_labels?: {
    website?: 'ai_suggested' | 'verified' | 'manual'
    contact_email?: 'ai_suggested' | 'verified' | 'manual'
    contact_person?: 'ai_suggested' | 'verified' | 'manual'
    description?: 'ai_suggested' | 'verified' | 'manual'
  }

  // Dynamic AI scoring & Cold outreach
  ai_score?: number | null
  ai_reasoning?: string | null
  ai_points_breakdown?: Array<{ criterion: string; points: number; note: string }>
  cold_email_draft?: ColdPitchDraft | null
}

export interface Region {
  id: string
  name: string
  code: string | null
  created_at: string
}

export interface PitchBrief {
  opening_line: string
  talking_points: string[]
  objection: string
  reply: string
  updated_at?: string
  is_manual?: boolean
  is_sample?: boolean
  label?: string
  source?: string
}

export interface Match {
  id: string
  user_id: string
  product_id: string
  company_id: string
  score: number | null
  tier: MatchTier | null
  reasoning: string | null
  brief: string | null
  call_status: CallStatus | string | null
  follow_up_at: string | null
  created_at: string
  // Joined relation fields for UI
  company?: Company
  product?: Product
  parsedBrief?: PitchBrief | null
}

export interface MatchScoreResult {
  score: number
  tier: MatchTier
  reasoning: string
}

export type CompanyStage = 'all' | 'startup' | 'scaleup' | 'enterprise'

export interface TargetProspectPreferences {
  stage: CompanyStage
  targetRegion: string
  keyword: string
  leadType: 'all' | 'buyer' | 'distributor' | 'partner'
}

export interface BelugaFilterState {
  searchQuery: string
  tier: 'all' | MatchTier
  region: string
  industry: string
  dataConfidence: 'all' | DataConfidence
}

export interface CalendarEvent {
  id: string
  user_id: string
  type: string
  title: string
  due_at: string | null
  linked_type: string | null
  linked_id: string | null
  status: string | null
  created_at: string
}
