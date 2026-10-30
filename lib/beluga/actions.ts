'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { gateway } from '@/lib/gateway'
import {
  Product,
  Company,
  Match,
  PitchBrief,
  MatchScoreResult,
  CallStatus,
  MatchTier,
  CalendarEvent,
} from './types'
import { calculateDeterministicScore, parseBrief } from './utils'
import {
  crawlWebProspectsWithAi,
  generatePitchWithAi,
  parseAndFixUploadedDataWithAi,
  scoreCompanyDynamicWithAi,
  generateColdOutreachEmailWithAi,
} from './ai-service'
import { ColdPitchDraft } from './types'

// In-memory fallback stores for preview mode without Supabase connection
let previewProducts: Product[] = [
  {
    id: 'prod-sample-1',
    user_id: 'dev-user-id',
    name: 'CreatorPulse Analytics',
    industry: 'AI & Creator Tools',
    icp: 'Digital creators, YouTubers, and agency managers managing cross-platform publishing and sponsor deliverables.',
    description: 'An AI-powered performance dashboard tracking creator revenue, viewer retention trends, and brand deal ROI.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

let previewMatches: Match[] = []

const SAMPLE_COMPANIES: Company[] = [
  {
    id: 'comp-blr-1',
    region: 'India - Bengaluru',
    company: 'Zenith Creator Labs',
    industry: 'AI & Creator Economy',
    start_date: '2023',
    headcount: 22,
    lat: 12.9352,
    lng: 77.6245,
    approx_location: 'Koramangala 4th Block, Bengaluru',
    location_confidence: 'approximate',
    description: 'Generative video and audio production tools for digital creators and studio brands.',
    contact_email: 'hello@zenithcreator.in',
    website: 'https://zenithcreator.in',
    contact_person: 'Aarav Sharma (Co-founder)',
    contact_phone: null,
    data_confidence: 'sample',
    ai_score: 92,
    ai_reasoning: 'Matches startup stage (+35 pts, founded in 2023), creator tech alignment (+35 pts), and Koramangala hub location (+22 pts).',
    created_at: new Date().toISOString(),
  },
  {
    id: 'comp-blr-2',
    region: 'India - Bengaluru',
    company: 'Kavach FinTech Protocol',
    industry: 'FinTech & Embedded Finance',
    start_date: '2022',
    headcount: 48,
    lat: 12.9121,
    lng: 77.6446,
    approx_location: 'HSR Layout Sector 2, Bengaluru',
    location_confidence: 'approximate',
    description: 'Instant creator micro-settlements and automated revenue compliance infrastructure.',
    contact_email: 'outreach@kavachfin.in',
    website: 'https://kavachfin.in',
    contact_person: 'Pooja Iyer (Head of Partnerships)',
    contact_phone: null,
    data_confidence: 'sample',
    ai_score: 86,
    ai_reasoning: 'Startup in HSR Layout with strong demand for automated creator monetization integrations.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'comp-blr-3',
    region: 'India - Bengaluru',
    company: 'IndiStream Media Network',
    industry: 'Media & OTT Tech',
    start_date: '2021',
    headcount: 36,
    lat: 12.9784,
    lng: 77.6408,
    approx_location: '100ft Road, Indiranagar, Bengaluru',
    location_confidence: 'approximate',
    description: 'Regional language digital video distribution and programmatic sponsorship network.',
    contact_email: 'partners@indistream.in',
    website: 'https://indistream.in',
    contact_person: 'Rohan Deshmukh (VP Growth)',
    contact_phone: null,
    data_confidence: 'sample',
    ai_score: 82,
    ai_reasoning: 'Indiranagar media startup actively scaling its creator partnership pipeline.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'comp-blr-4',
    region: 'India - Bengaluru',
    company: 'Strata Cloud Systems',
    industry: 'Developer Tools & SaaS',
    start_date: '2020',
    headcount: 85,
    lat: 12.9698,
    lng: 77.7499,
    approx_location: 'ITPL Main Road, Whitefield, Bengaluru',
    location_confidence: 'approximate',
    description: 'Scalable cloud telemetry and automated API monitoring for high-growth tech ventures.',
    contact_email: 'enterprise@stratacloud.io',
    website: 'https://stratacloud.io',
    contact_person: 'Ananya Hegde (Head of Enterprise Sales)',
    contact_phone: null,
    data_confidence: 'sample',
    ai_score: 68,
    ai_reasoning: 'Whitefield scaleup with enterprise budget; moderately aligned with creator workflows.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'comp-blr-5',
    region: 'India - Bengaluru',
    company: 'BlinkRoute Logistics',
    industry: 'Supply Chain & Quick Commerce',
    start_date: '2022',
    headcount: 42,
    lat: 12.926,
    lng: 77.6762,
    approx_location: 'Outer Ring Road, Bellandur, Bengaluru',
    location_confidence: 'approximate',
    description: 'Real-time urban fulfillment and hyperlocal routing algorithms for modern D2C commerce.',
    contact_email: 'contact@blinkroute.in',
    website: 'https://blinkroute.in',
    contact_person: 'Vikram Nair (Product Lead)',
    contact_phone: null,
    data_confidence: 'sample',
    ai_score: 74,
    ai_reasoning: 'Bellandur tech startup founded in 2022 seeking digital influencer amplification.',
    created_at: new Date().toISOString(),
  },
]



// -----------------------------------------------------------------------------
// DEV FALLBACK ENFORCEMENT
// -----------------------------------------------------------------------------

function isDevFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_FALLBACK === 'true'
}

function ensureSupabaseConfig(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (!isDevFallbackAllowed()) {
      throw new Error(
        'Supabase credentials missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured in environment variables. In-memory dev fallback is disabled.'
      )
    }
    return true
  }
  return false
}

export async function checkIsDevFallback(): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (!supabaseUrl || !supabaseKey) && isDevFallbackAllowed()
}

// -----------------------------------------------------------------------------
// PRODUCT OPERATIONS
// -----------------------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const useFallback = ensureSupabaseConfig()
  if (useFallback) {
    return previewProducts
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`)
  }

  return (data || []) as Product[]
}

export async function saveProduct(input: {
  id?: string
  name: string
  industry: string
  icp: string
  description: string
}): Promise<{ success: boolean; product?: Product; error?: string }> {
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: 'Product name must be at least 2 characters.' }
  }

  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    if (input.id) {
      const idx = previewProducts.findIndex((p) => p.id === input.id)
      if (idx !== -1) {
        previewProducts[idx] = {
          ...previewProducts[idx],
          name: input.name,
          industry: input.industry,
          icp: input.icp,
          description: input.description,
        }
        revalidatePath('/dashboard/beluga')
        return { success: true, product: previewProducts[idx] }
      }
    }
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      user_id: 'dev-user-id',
      name: input.name,
      industry: input.industry,
      icp: input.icp,
      description: input.description,
      created_at: new Date().toISOString(),
    }
    previewProducts.unshift(newProd)
    revalidatePath('/dashboard/beluga')
    return { success: true, product: newProd }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User must be authenticated.' }
  }

  if (input.id) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: input.name,
        industry: input.industry,
        icp: input.icp,
        description: input.description,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }
    revalidatePath('/dashboard/beluga')
    return { success: true, product: data as Product }
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: input.name,
        industry: input.industry,
        icp: input.icp,
        description: input.description,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }
    revalidatePath('/dashboard/beluga')
    return { success: true, product: data as Product }
  }
}

// -----------------------------------------------------------------------------
// COMPANY & RADAR OPERATIONS
// -----------------------------------------------------------------------------

export async function getCompanies(): Promise<Company[]> {
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    // No hardcoded sample companies — the map starts clean.
    // Users upload data or use AI Web Scout to discover prospects.
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load companies: ${error.message}`)
  }

  return (data || []) as Company[]
}

// -----------------------------------------------------------------------------
// MATCH OPERATIONS
// -----------------------------------------------------------------------------

export async function getMatches(productId: string): Promise<Match[]> {
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    return previewMatches
      .filter((m) => m.product_id === productId)
      .map((m) => ({
        ...m,
        parsedBrief: parseBrief(m.brief),
      }))
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return (data as Match[]).map((m) => ({
    ...m,
    parsedBrief: parseBrief(m.brief),
  }))
}

export async function saveMatch(
  productId: string,
  companyId: string,
  product: Product,
  company: Company
): Promise<{ success: boolean; match?: Match; error?: string }> {
  const scoreResult = calculateDeterministicScore(product, company)
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    const existing = previewMatches.find(
      (m) => m.product_id === productId && m.company_id === companyId
    )
    if (existing) {
      return { success: true, match: existing }
    }
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      user_id: 'dev-user-id',
      product_id: productId,
      company_id: companyId,
      score: scoreResult.score,
      tier: scoreResult.tier,
      reasoning: scoreResult.reasoning,
      brief: null,
      call_status: 'not_contacted',
      follow_up_at: null,
      created_at: new Date().toISOString(),
      company,
      product,
      parsedBrief: null,
    }
    previewMatches.unshift(newMatch)
    revalidatePath('/dashboard/beluga')
    return { success: true, match: newMatch }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User must be authenticated.' }
  }

  // Upsert match with unique pair constraint handling
  const { data, error } = await supabase
    .from('matches')
    .upsert(
      {
        user_id: user.id,
        product_id: productId,
        company_id: companyId,
        score: scoreResult.score,
        tier: scoreResult.tier,
        reasoning: scoreResult.reasoning,
      },
      { onConflict: 'user_id,product_id,company_id' }
    )
    .select(`
      *,
      company:companies(*)
    `)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/beluga')
  return {
    success: true,
    match: {
      ...(data as Match),
      parsedBrief: parseBrief(data.brief),
    },
  }
}

export async function updateMatchTier(
  matchId: string,
  tier: MatchTier
): Promise<{ success: boolean; error?: string }> {
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    const m = previewMatches.find((x) => x.id === matchId)
    if (m) m.tier = tier
    revalidatePath('/dashboard/beluga')
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthenticated' }

  const { error } = await supabase
    .from('matches')
    .update({ tier })
    .eq('id', matchId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/beluga')
  return { success: true }
}

// -----------------------------------------------------------------------------
// PITCH BRIEF OPERATIONS (AI GATEWAY & MANUAL SAVE)
// -----------------------------------------------------------------------------

export async function crawlProspectsAction(
  directive: string,
  product: Product,
  userPreferencesText = ''
): Promise<{ success: boolean; companies: Company[]; error?: string }> {
  try {
    const companies = await crawlWebProspectsWithAi(
      directive,
      product,
      userPreferencesText
    )
    return { success: true, companies }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Crawler error'
    return { success: false, companies: [], error: msg }
  }
}

export async function parseUploadedDataAction(
  rawInput: string,
  product: Product,
  userPreferencesText = ''
): Promise<{ success: boolean; companies: Company[]; error?: string }> {
  try {
    const companies = await parseAndFixUploadedDataWithAi(
      rawInput,
      product,
      userPreferencesText
    )
    return { success: true, companies }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Parsing error'
    return { success: false, companies: [], error: msg }
  }
}

export async function scoreProspectDynamicAction(
  product: Product,
  company: Company,
  userPreferencesText: string
): Promise<{
  success: boolean
  score: number
  tier: 'high' | 'mid' | 'least'
  points_breakdown: Array<{ criterion: string; points: number; note: string }>
  reasoning: string
  error?: string
}> {
  try {
    const result = await scoreCompanyDynamicWithAi(product, company, userPreferencesText)
    return {
      success: true,
      score: result.score,
      tier: result.tier,
      points_breakdown: result.points_breakdown,
      reasoning: result.reasoning,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Scoring error'
    return {
      success: false,
      score: 50,
      tier: 'mid',
      points_breakdown: [],
      reasoning: 'AI scoring service encountered an error.',
      error: msg,
    }
  }
}

export async function generateColdOutreachAction(
  product: Product,
  company: Company
): Promise<{ success: boolean; draft?: ColdPitchDraft; error?: string }> {
  try {
    const draft = await generateColdOutreachEmailWithAi(product, company)
    return { success: true, draft }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cold outreach generation error'
    return { success: false, error: msg }
  }
}

export async function generatePitchBrief(
  matchId: string,
  product: Product,
  company: Company
): Promise<{
  success: boolean
  brief?: PitchBrief
  warnings?: string[]
  error?: string
  code?: string
  label?: string
  source?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const token = session?.access_token || 'mock-dev-token'

    // Call the documented contract: POST /v1/generate with task: 'pitch_brief'
    const res = await gateway.generate(token, {
      task: 'pitch_brief',
      input: {
        product: product.name,
        company: company.company,
      },
    })

    let briefOutput: PitchBrief

    // Check if gateway returned structured pitch output
    if (
      res.output &&
      typeof res.output === 'object' &&
      'opening_line' in res.output
    ) {
      const out = res.output as Record<string, unknown>
      briefOutput = {
        opening_line: String(out.opening_line || ''),
        talking_points: Array.isArray(out.talking_points)
          ? (out.talking_points as string[])
          : [],
        objection: String(out.objection || ''),
        reply: String(out.reply || ''),
        updated_at: new Date().toISOString(),
        is_manual: false,
        label: res.label,
        source: res.source,
      }
    } else {
      briefOutput = {
        opening_line: `Hi ${company.company} team, we noticed your focus on ${company.industry || 'the creator space'} and built ${product.name} specifically to solve ${product.icp?.slice(0, 60) || 'creator workflows'}.`,
        talking_points: [
          `Tailored for ${company.industry || 'your industry'}: seamless workflow automation.`,
          `High ICP match: engineered for ${product.icp?.slice(0, 45) || 'teams of your scale'}.`,
          `Demonstrated ROI: eliminates manual bottlenecks and accelerates partner conversion.`,
        ],
        objection: `We already use an existing vendor or internal script for this.`,
        reply: `${product.name} was built to integrate cleanly without vendor lock-in, cutting cycle time by 40%.`,
        updated_at: new Date().toISOString(),
        is_manual: false,
        label: res.label,
        source: res.source,
      }
    }

    // Automatically persist the generated brief into matches.brief
    await saveBrief(matchId, briefOutput)

    return {
      success: true,
      brief: briefOutput,
      label: res.label,
      source: res.source,
      warnings: res.warnings || [],
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI Gateway generation failed'
    const code = (err as { code?: string })?.code || 'gateway_error'
    return {
      success: false,
      error: msg,
      code,
    }
  }
}

export async function saveBrief(
  matchId: string,
  brief: PitchBrief
): Promise<{ success: boolean; error?: string }> {
  const briefPayload: PitchBrief = {
    ...brief,
    updated_at: new Date().toISOString(),
  }
  const serialized = JSON.stringify(briefPayload)

  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    const m = previewMatches.find((x) => x.id === matchId)
    if (m) {
      m.brief = serialized
      m.parsedBrief = briefPayload
    }
    revalidatePath('/dashboard/beluga')
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthenticated' }

  const { error } = await supabase
    .from('matches')
    .update({ brief: serialized })
    .eq('id', matchId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/beluga')
  return { success: true }
}

// -----------------------------------------------------------------------------
// FOLLOW-UP & CALENDAR INTEGRATION
// -----------------------------------------------------------------------------

export async function scheduleFollowUp(
  matchId: string,
  followUpAt: string,
  callStatus: CallStatus,
  companyName: string,
  productName: string
): Promise<{ success: boolean; error?: string }> {
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    const m = previewMatches.find((x) => x.id === matchId)
    if (m) {
      m.follow_up_at = followUpAt
      m.call_status = callStatus
    }
    revalidatePath('/dashboard/beluga')
    revalidatePath('/dashboard/calendar')
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthenticated' }

  // 1. Update matches table
  const { error: matchError } = await supabase
    .from('matches')
    .update({
      follow_up_at: followUpAt,
      call_status: callStatus,
    })
    .eq('id', matchId)
    .eq('user_id', user.id)

  if (matchError) return { success: false, error: matchError.message }

  // 2. Synchronize with events table using linked_type: 'beluga_match'
  const eventTitle = `Beluga: Follow up with ${companyName} (${productName})`

  // Look for existing event linked to this match (supports 'beluga_match' and legacy 'match')
  const { data: existingEvent } = await supabase
    .from('events')
    .select('id')
    .eq('user_id', user.id)
    .in('linked_type', ['beluga_match', 'match'])
    .eq('linked_id', matchId)
    .maybeSingle()

  if (existingEvent) {
    await supabase
      .from('events')
      .update({
        title: eventTitle,
        due_at: followUpAt,
        status: callStatus,
        linked_type: 'beluga_match',
      })
      .eq('id', existingEvent.id)
  } else {
    await supabase.from('events').insert({
      user_id: user.id,
      type: 'follow_up',
      title: eventTitle,
      due_at: followUpAt,
      linked_type: 'beluga_match',
      linked_id: matchId,
      status: callStatus,
    })
  }

  revalidatePath('/dashboard/beluga')
  revalidatePath('/dashboard/calendar')
  return { success: true }
}

export async function clearFollowUp(
  matchId: string
): Promise<{ success: boolean; error?: string }> {
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    const m = previewMatches.find((x) => x.id === matchId)
    if (m) {
      m.follow_up_at = null
      m.call_status = 'not_contacted'
    }
    revalidatePath('/dashboard/beluga')
    revalidatePath('/dashboard/calendar')
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthenticated' }

  // 1. Clear in matches table
  await supabase
    .from('matches')
    .update({
      follow_up_at: null,
      call_status: 'not_contacted',
    })
    .eq('id', matchId)
    .eq('user_id', user.id)

  // 2. Delete or cancel event in events table
  await supabase
    .from('events')
    .delete()
    .eq('user_id', user.id)
    .in('linked_type', ['beluga_match', 'match'])
    .eq('linked_id', matchId)

  revalidatePath('/dashboard/beluga')
  revalidatePath('/dashboard/calendar')
  return { success: true }
}

export async function getUpcomingFollowUps(): Promise<Match[]> {
  const useFallback = ensureSupabaseConfig()

  if (useFallback) {
    return previewMatches.filter((m) => m.follow_up_at !== null)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      company:companies(*),
      product:products(*)
    `)
    .eq('user_id', user.id)
    .not('follow_up_at', 'is', null)
    .order('follow_up_at', { ascending: true })

  return (data as Match[]) || []
}
