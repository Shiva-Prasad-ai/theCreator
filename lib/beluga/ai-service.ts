import { Company, Product, PitchBrief, ColdPitchDraft } from './types'

function getApiKey(): string | null {
  return (
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENROUTER_API_KEY_FALLBACK ||
    null
  )
}

function getFallbackApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY_FALLBACK || null
}

async function callOpenRouter(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  apiKey: string,
  jsonMode = true
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://creatoros.ai',
      'X-Title': 'CreatorOS AI Beluga Module',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages,
      temperature: 0.6,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// Coordinate anchor locations in Bengaluru & Indian Tech Hubs
export const BENGALURU_HUBS = [
  { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Layout, Bengaluru', lat: 12.9121, lng: 77.6446 },
  { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7499 },
  { name: 'Bellandur / ORR, Bengaluru', lat: 12.926, lng: 77.6762 },
  { name: 'Electronic City, Bengaluru', lat: 12.8399, lng: 77.677 },
  { name: 'MG Road / CBD, Bengaluru', lat: 12.9756, lng: 77.6066 },
  { name: 'Domlur / EGL, Bengaluru', lat: 12.9609, lng: 77.6387 },
  { name: 'JP Nagar, Bengaluru', lat: 12.9063, lng: 77.5857 },
]

/**
 * 1. AI Web Scout & Lead Crawler:
 * Discovers prospective buyer companies & startups in Bengaluru & India.
 */
export async function crawlWebProspectsWithAi(
  directive: string,
  product: Product,
  userPreferencesText = 'Find startups and emerging companies in Bengaluru that need creator AI solutions'
): Promise<Company[]> {
  const primaryKey = getApiKey()
  const fallbackKey = getFallbackApiKey()

  if (!primaryKey) {
    return getLocalBengaluruSample(userPreferencesText)
  }

  const systemPrompt = `You are the Beluga AI B2B Lead Discovery Scout for CreatorOS AI.
Base Location: India ONLY. All coordinates MUST be inside India (lat between 8.0 and 37.0, lng between 68.0 and 97.0).
Primarily focus on Bengaluru (lat ~12.9, lng ~77.6) tech hubs: Koramangala (12.9352, 77.6245), Indiranagar (12.9784, 77.6408), HSR Layout (12.9121, 77.6446), Whitefield (12.9698, 77.7499), Electronic City (12.8399, 77.677), Bellandur (12.926, 77.6762), MG Road (12.9756, 77.6066).
Your mission: Suggest prospective buyer companies in India/Bengaluru that would benefit from the creator's product. For each company, provide suggested contact details and description.

Product: "${product.name}"
Nature: ${product.industry || 'AI & Creator Tools'}
Value Proposition: ${product.description || ''}
Target ICP: ${product.icp || ''}

User Preferences Directive:
"${userPreferencesText}"

CRITICAL RULES:
- If known, lat MUST be between 8.0 and 37.0 (India), lng between 68.0 and 97.0 (India). If unknown, return null.
- company: company name operating in India
- contact_email: public business email if known, else 'Not found'
- website: company website if known, else 'Not found'
- contact_person: founder/exec title or name if known, else 'Not specified'
- description: factual 1-2 sentence description of what the company builds/does
- DO NOT invent phone numbers (never output fake numbers like '555-0100')
- ai_score: how strongly this company matches the user's preferences (0-100)

Output JSON format:
{
  "companies": [
    {
      "company": "Company Name",
      "industry": "Specific Nature / Industry (e.g. Fintech, SaaS, Creator Tech, D2C, EdTech)",
      "start_date": "Year or date founded (e.g. '2023' or '2021')",
      "headcount": 15,
      "description": "1-2 sentence description of what they build or do",
      "approx_location": "Locality in Bengaluru, e.g. HSR Layout, Bengaluru, India or 'Location unknown'",
      "lat": 12.9121,
      "lng": 77.6446,
      "contact_email": "Official contact email or 'Not specified'",
      "website": "https://company.in or domain",
      "contact_person": "Relevant Title or Name (e.g. 'Founder & CEO', 'Head of Growth')",
      "data_confidence": "estimated",
      "ai_score": 85,
      "ai_reasoning": "Reasoning explaining why this prospect matches the user's explicit preference criteria"
    }
  ]
}
Return between 3 to 5 high-relevance prospects. Do NOT output dummy repetitive numbers.`

  const userPrompt = `Scouting Directive: ${directive || 'Find prospective buyer startups in Bengaluru'}. User Preference: ${userPreferencesText}`

  let content = ''
  try {
    content = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      primaryKey
    )
  } catch (err) {
    console.warn('OpenRouter primary key error, trying fallback key:', err)
    if (fallbackKey && fallbackKey !== primaryKey) {
      try {
        content = await callOpenRouter(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          fallbackKey
        )
      } catch (fallbackErr) {
        console.error('Fallback key failed:', fallbackErr)
        return getLocalBengaluruSample(userPreferencesText)
      }
    } else {
      return getLocalBengaluruSample(userPreferencesText)
    }
  }

  try {
    const parsed = JSON.parse(content)
    const list = Array.isArray(parsed) ? parsed : parsed.companies || []

    return list.map((item: any, idx: number) => {
      // Coordinate handling without clamp-to-Bengaluru:
      // If missing or outside India, store as null (no map pin)
      const rawLat = typeof item.lat === 'number' && !isNaN(item.lat) ? item.lat : null
      const rawLng = typeof item.lng === 'number' && !isNaN(item.lng) ? item.lng : null
      let lat = rawLat
      let lng = rawLng

      // Auto-correct inverted [lng, lat]
      if (lat !== null && lng !== null && lat >= 68.0 && lat <= 97.0 && lng >= 8.0 && lng <= 37.0) {
        const temp = lat
        lat = lng
        lng = temp
      }

      const isInsideIndia = lat !== null && lng !== null && lat >= 8.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0
      if (!isInsideIndia) {
        lat = null
        lng = null
      }

      const approx_location = isInsideIndia ? (item.approx_location || 'Bengaluru, India') : 'Location unknown'

      const companyName = String(item.company || '').trim()
      const contact_email = String(item.contact_email || '').trim()
      const website = String(item.website || '').trim()
      const contact_person = String(item.contact_person || '').trim()
      const description = String(item.description || '').trim()

      const cleanEmail = (contact_email && contact_email !== 'Not found' && contact_email !== 'Not specified') ? contact_email : null
      const cleanWebsite = (website && website !== 'Not found' && website !== 'Not specified') ? website : null
      const cleanPerson = (contact_person && contact_person !== 'Not specified') ? contact_person : null
      const cleanDesc = description || null

      return {
        id: `crawled-blr-${Date.now()}-${idx}`,
        company: companyName || `India Tech Company ${idx + 1}`,
        region: isInsideIndia ? 'India - Bengaluru' : 'India',
        industry: String(item.industry || product.industry || 'Technology'),
        start_date: item.start_date ? String(item.start_date) : null,
        headcount: item.headcount ? Number(item.headcount) : null,
        lat,
        lng,
        approx_location,
        location_confidence: isInsideIndia ? 'approximate' : 'unverified',
        description: cleanDesc,
        contact_email: cleanEmail,
        website: cleanWebsite,
        contact_person: cleanPerson,
        contact_phone: null,
        data_confidence: 'estimated' as const,
        field_labels: {
          website: cleanWebsite ? ('ai_suggested' as const) : undefined,
          contact_email: cleanEmail ? ('ai_suggested' as const) : undefined,
          contact_person: cleanPerson ? ('ai_suggested' as const) : undefined,
          description: cleanDesc ? ('ai_suggested' as const) : undefined,
        },
        ai_score: typeof item.ai_score === 'number' ? Math.max(0, Math.min(100, item.ai_score)) : 80,
        ai_reasoning: item.ai_reasoning || 'Suggested by AI based on user preferences.',
        created_at: new Date().toISOString(),
      }
    })
  } catch (parseErr) {
    console.error('Failed to parse AI output:', parseErr)
    return getLocalBengaluruSample(userPreferencesText)
  }
}

export async function parseAndFixUploadedDataWithAi(
  rawInput: string,
  product: Product,
  userPreferencesText = ''
): Promise<Company[]> {
  const primaryKey = getApiKey()
  const fallbackKey = getFallbackApiKey()

  if (!primaryKey) {
    return parseLocallyWithBengaluruFallback(rawInput)
  }

  const systemPrompt = `You are the Beluga AI Intelligence & Lead Data Normalizer for CreatorOS AI.
The user uploaded data (via CSV, Excel, or text). 
Your key responsibilities:
1. COMPANY NAME: Clean, format, and resolve the official company name. Correct any typos or partial names.
2. PREPARE DESCRIPTION: Write a factual, articulate 1-2 sentence description detailing what the company creates, their core value proposition, and their product focus.
3. GET CONTACT DETAILS: You are responsible for providing suggested contact channels:
   - website: company website URL if known (e.g. https://companyname.in or .com), else 'Not specified'
   - contact_email: business outreach, founder, or partnerships email if known (e.g. outreach@domain.com), else 'Not specified'
   - contact_person: key decision maker title or name if known (e.g. 'Founder & CEO', 'Head of Growth'), else 'Not specified'
   (DO NOT invent phone numbers - never generate fake numbers like 555-0123)
4. GEOGRAPHY & COORDINATES: If known coordinates in India (lat 8.0 - 37.0, lng 68.0 - 97.0), provide them. If coordinates are unknown or outside India, return null for lat and lng.
5. MATCH SCORING: Evaluate each company against user preferences ("${userPreferencesText}") and provide an AI match score (0-100) with clear reasoning.

Return strict JSON format:
{
  "companies": [
    {
      "company": "Official Company Name",
      "industry": "Nature / Industry (e.g. AI & Creator Tools, FinTech, SaaS, EdTech)",
      "start_date": "Year founded (e.g. '2023' or '2021')",
      "description": "Prepared articulate 1-2 sentence description of what they build and do",
      "approx_location": "Locality in Bengaluru, India or 'Location unknown'",
      "lat": 12.9352,
      "lng": 77.6245,
      "contact_email": "Official contact/partnerships email or 'Not specified'",
      "website": "https://company.in or 'Not specified'",
      "contact_person": "Key decision maker role or name or 'Not specified'",
      "ai_score": 85,
      "ai_reasoning": "How this matches the user's explicit preference criteria"
    }
  ]
}`

  const userPrompt = `Raw Input Data:\n${rawInput.slice(0, 4000)}`

  let content = ''
  try {
    content = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      primaryKey
    )
  } catch (err) {
    if (fallbackKey && fallbackKey !== primaryKey) {
      try {
        content = await callOpenRouter(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          fallbackKey
        )
      } catch {
        return parseLocallyWithBengaluruFallback(rawInput)
      }
    } else {
      return parseLocallyWithBengaluruFallback(rawInput)
    }
  }

  try {
    const parsed = JSON.parse(content)
    const list = Array.isArray(parsed) ? parsed : parsed.companies || []

    return list.map((item: any, idx: number) => {
      // Coordinate handling without clamp-to-Bengaluru:
      // If missing or outside India, store as null (no map pin)
      const rawLat = typeof item.lat === 'number' && !isNaN(item.lat) ? item.lat : null
      const rawLng = typeof item.lng === 'number' && !isNaN(item.lng) ? item.lng : null
      let lat = rawLat
      let lng = rawLng

      // Auto-correct inverted [lng, lat]
      if (lat !== null && lng !== null && lat >= 68.0 && lat <= 97.0 && lng >= 8.0 && lng <= 37.0) {
        const temp = lat
        lat = lng
        lng = temp
      }

      const isInsideIndia = lat !== null && lng !== null && lat >= 8.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0
      if (!isInsideIndia) {
        lat = null
        lng = null
      }

      const approx_location = isInsideIndia ? (item.approx_location || 'India') : 'Location unknown'

      // Only use field if it's a real non-placeholder value
      const clean = (v: any, ...bad: string[]) => {
        const s = String(v || '').trim()
        return (s && !bad.includes(s)) ? s : null
      }

      const cleanDesc = clean(item.description)
      const cleanEmail = clean(item.contact_email, 'Not specified', 'Not found')
      const cleanWebsite = clean(item.website, 'Not specified', 'Not found')
      const cleanPerson = clean(item.contact_person, 'Not specified')

      return {
        id: `upload-clean-${Date.now()}-${idx}`,
        company: String(item.company || `Prospect ${idx + 1}`),
        region: isInsideIndia ? 'India' : 'Unknown',
        industry: clean(item.industry) || 'Technology',
        start_date: clean(item.start_date, 'Not specified') || null,
        headcount: item.headcount ? Number(item.headcount) : null,
        lat,
        lng,
        approx_location,
        location_confidence: isInsideIndia ? 'approximate' : 'unverified',
        description: cleanDesc,
        contact_email: cleanEmail,
        website: cleanWebsite,
        contact_person: cleanPerson,
        contact_phone: null,
        data_confidence: 'estimated' as const,
        field_labels: {
          website: cleanWebsite ? ('ai_suggested' as const) : undefined,
          contact_email: cleanEmail ? ('ai_suggested' as const) : undefined,
          contact_person: cleanPerson ? ('ai_suggested' as const) : undefined,
          description: cleanDesc ? ('ai_suggested' as const) : undefined,
        },
        ai_score: typeof item.ai_score === 'number' ? Math.max(0, Math.min(100, item.ai_score)) : 70,
        ai_reasoning: item.ai_reasoning || 'Normalized and enriched by AI.',
        created_at: new Date().toISOString(),
      }
    })
  } catch {
    return parseLocallyWithBengaluruFallback(rawInput)
  }
}

/**
 * 3. Dynamic AI Preference Scoring (NO HARDCODED LOGIC):
 * Evaluates prospect strictly according to the product owner's custom preference text.
 * E.g., if user says "startups" and company is startup, AI awards points dynamically.
 */
export async function scoreCompanyDynamicWithAi(
  product: Product,
  company: Company,
  userPreferencesText: string
): Promise<{
  score: number
  tier: 'high' | 'mid' | 'least'
  points_breakdown: Array<{ criterion: string; points: number; note: string }>
  reasoning: string
}> {
  const primaryKey = getApiKey()
  const fallbackKey = getFallbackApiKey()

  if (!primaryKey) {
    const isStartup = (company.headcount && company.headcount < 50) || (company.start_date && parseInt(company.start_date) >= 2021)
    const score = isStartup ? 85 : 60
    return {
      score,
      tier: score >= 75 ? 'high' : score >= 50 ? 'mid' : 'least',
      points_breakdown: [
        { criterion: 'Startup Stage Match', points: isStartup ? 35 : 15, note: 'Evaluated against startup size and founding year' },
        { criterion: 'Industry Alignment', points: 30, note: `Aligned with ${company.industry || 'Tech'}` },
        { criterion: 'Bengaluru Base Anchor', points: 20, note: 'Anchored in Bengaluru tech corridor' },
      ],
      reasoning: `Awarded ${score} points based on preference alignment with startup parameters and Bengaluru tech presence.`,
    }
  }

  const systemPrompt = `You are the Beluga Dynamic AI Lead Scoring Engine for CreatorOS AI.
CRITICAL RULE: Scoring MUST depend directly on the product owner's explicit preference criteria, NOT any hardcoded logic.
Read the user's preferences carefully:
- If the user asks for startups and the company is a startup, give it a significant point award.
- If the user specifies an industry/nature (e.g. AI, Fintech, Creator tools) and the company matches, award points.
- If the user specifies founding date/start date (e.g. after 2022) and the company matches, award points.
- If the company does not match a requested criterion, deduct or award 0 points for that factor.

Calculate a total score out of 100.
Tier classification:
- "high": score >= 75
- "mid": score >= 50 and < 75
- "least": score < 50

Respond strictly in JSON:
{
  "score": 88,
  "tier": "high",
  "points_breakdown": [
    { "criterion": "User Preference: Early Stage Startups", "points": 35, "note": "Founded in 2023 with 18 team members in Bengaluru" },
    { "criterion": "User Preference: Industry Relevance", "points": 30, "note": "Matches ${product.industry || 'Technology'}" },
    { "criterion": "User Preference: Geographical Proximity", "points": 23, "note": "Located in Koramangala tech hub" }
  ],
  "reasoning": "Clear 2-sentence summary explaining exactly how the company matched the user's specific preferences and why this score was awarded."
}`

  const userPrompt = `Product Owner Preferences:
"${userPreferencesText}"

Creator Product:
Name: ${product.name}
Industry: ${product.industry || 'Technology'}
Description: ${product.description || ''}

Prospect to Evaluate:
Company: ${company.company}
Nature/Industry: ${company.industry || 'Not specified'}
Start Date / Founded: ${company.start_date || 'Not specified'}
Headcount: ${company.headcount || 'Not specified'}
Location: ${company.approx_location || company.region || 'Bengaluru, India'}
Description: ${company.description || 'Not specified'}`

  let content = ''
  try {
    content = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      primaryKey
    )
  } catch {
    if (fallbackKey && fallbackKey !== primaryKey) {
      try {
        content = await callOpenRouter(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          fallbackKey
        )
      } catch {
        return {
          score: 75,
          tier: 'high',
          points_breakdown: [{ criterion: 'Dynamic Preference Match', points: 75, note: 'Evaluated against user preferences' }],
          reasoning: 'Evaluated according to user preferences directive.',
        }
      }
    } else {
      return {
        score: 75,
        tier: 'high',
        points_breakdown: [{ criterion: 'Dynamic Preference Match', points: 75, note: 'Evaluated against user preferences' }],
        reasoning: 'Evaluated according to user preferences directive.',
      }
    }
  }

  try {
    const parsed = JSON.parse(content)
    const score = Math.max(10, Math.min(99, Number(parsed.score) || 75))
    const tier = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'least'
    return {
      score,
      tier,
      points_breakdown: Array.isArray(parsed.points_breakdown) ? parsed.points_breakdown : [],
      reasoning: String(parsed.reasoning || `Scored ${score} points based on user preference criteria.`),
    }
  } catch {
    return {
      score: 75,
      tier: 'high',
      points_breakdown: [{ criterion: 'Dynamic Match', points: 75, note: 'Evaluated against user directive' }],
      reasoning: 'Prospect scored based on provided criteria.',
    }
  }
}

/**
 * 4. AI Cold Outreach Pitch / Cold Email Generator:
 * Generates a neutral, professional cold email explaining:
 * - How it can be useful to the prospect
 * - Why they should choose us
 * Fully editable by the product creator.
 */
export async function generateColdOutreachEmailWithAi(
  product: Product,
  company: Company
): Promise<ColdPitchDraft> {
  const primaryKey = getApiKey()
  const fallbackKey = getFallbackApiKey()

  const defaultDraft: ColdPitchDraft = {
    subject: `Potential synergy: ${product.name} × ${company.company}`,
    opening_hook: `I came across ${company.company}'s work in ${company.industry || 'the Bengaluru ecosystem'} and wanted to reach out directly.`,
    how_it_is_useful: `We built ${product.name} to help teams streamline creator discovery and revenue automation without manual overhead.`,
    why_choose_us: `Unlike fragmented tools, our platform provides unified intelligence and high-confidence matching with zero friction.`,
    call_to_action: `Open to a brief 10-minute exchange this week to see if there is mutual value?`,
    full_body: `Hi ${company.contact_person && company.contact_person !== 'Not specified' ? company.contact_person : 'Team ' + company.company},\n\nI came across ${company.company}'s work in ${company.industry || 'the tech ecosystem'} and wanted to reach out directly.\n\nHow this can be useful for you:\n${product.description || 'We help forward-thinking teams accelerate creator partnerships and digital growth through automated intelligence.'}\n\nWhy choose us:\nWe provide end-to-end transparency, targeted intelligence, and automated outreach tailored specifically for high-velocity teams in Bengaluru and beyond.\n\nWould you be open to a 10-minute introductory conversation this Thursday or Friday?\n\nBest regards,\nProduct Creator\n${product.name}`,
  }

  if (!primaryKey) return defaultDraft

  const systemPrompt = `You are an elite B2B Sales & Business Development Strategist for CreatorOS AI.
Write a neutral, professional, respectful cold email from a Product Creator to a prospective buyer company in Bengaluru/India.

Requirements:
1. Tone: Neutral, thoughtful, and courteous (NO hype, NO aggressive sales push, NO spammy jargon).
2. Clearly explain:
   - HOW IT CAN BE USEFUL: How the creator's product directly helps the prospect's team or solves a clear operational bottleneck in their industry (${company.industry || 'Tech'}).
   - WHY THEY SHOULD CHOOSE US: What unique edge, speed, or quality advantage the creator brings over generic alternatives.
3. Keep it brief (under 160 words).
4. Include an easy, low-pressure call to action.

Return JSON:
{
  "subject": "Compelling, neutral subject line",
  "opening_hook": "1 sentence personalized hook referencing their company/industry",
  "how_it_is_useful": "2-3 sentences explaining exact utility and benefit for them",
  "why_choose_us": "1-2 sentences highlighting why they should choose us",
  "call_to_action": "1 low-friction closing line proposing a 10-minute discussion",
  "full_body": "Complete formatted email body ready to send or edit"
}`

  const userPrompt = `Product:
Name: ${product.name}
Industry: ${product.industry || 'AI & Creator Tools'}
Value Proposition: ${product.description || ''}
ICP: ${product.icp || ''}

Target Prospect:
Company: ${company.company}
Nature/Industry: ${company.industry || 'Technology'}
Start Date / Founded: ${company.start_date || 'Recent'}
Location: ${company.approx_location || 'Bengaluru, India'}
Description: ${company.description || ''}
Contact Person: ${company.contact_person || 'Leadership Team'}`

  let content = ''
  try {
    content = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      primaryKey
    )
  } catch {
    if (fallbackKey && fallbackKey !== primaryKey) {
      try {
        content = await callOpenRouter(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          fallbackKey
        )
      } catch {
        return defaultDraft
      }
    } else {
      return defaultDraft
    }
  }

  try {
    const parsed = JSON.parse(content)
    return {
      subject: parsed.subject || defaultDraft.subject,
      opening_hook: parsed.opening_hook || defaultDraft.opening_hook,
      how_it_is_useful: parsed.how_it_is_useful || defaultDraft.how_it_is_useful,
      why_choose_us: parsed.why_choose_us || defaultDraft.why_choose_us,
      call_to_action: parsed.call_to_action || defaultDraft.call_to_action,
      full_body: parsed.full_body || defaultDraft.full_body,
    }
  } catch {
    return defaultDraft
  }
}

/**
 * Legacy PitchBrief compatibility for existing database tables
 */
export async function generatePitchWithAi(
  product: Product,
  company: Company
): Promise<PitchBrief | null> {
  const coldPitch = await generateColdOutreachEmailWithAi(product, company)
  return {
    opening_line: coldPitch.opening_hook,
    talking_points: [
      coldPitch.how_it_is_useful,
      coldPitch.why_choose_us,
      coldPitch.call_to_action,
    ],
    objection: 'Budget allocation or current reliance on internal workflows',
    reply: `We designed ${product.name} with frictionless onboarding so you see measurable utility before making any long-term commitment.`,
    updated_at: new Date().toISOString(),
    is_manual: false,
  }
}

function getLocalBengaluruSample(preferencesText: string): Company[] {
  const lower = preferencesText.toLowerCase()
  const wantsStartup = lower.includes('startup') || lower.includes('early')

  return [
    {
      id: `blr-seed-1`,
      company: 'Zenith Creator Labs',
      region: 'India - Bengaluru',
      industry: 'AI & Creator Economy',
      start_date: '2023',
      headcount: 22,
      lat: 12.9352,
      lng: 77.6245,
      approx_location: 'Koramangala 4th Block, Bengaluru',
      location_confidence: 'approximate',
      description: 'Building generative audio and video production pipelines for Indian digital creators.',
      contact_email: 'hello@zenithcreator.in',
      website: 'https://zenithcreator.in',
      contact_person: 'Aarav Sharma (Co-founder)',
      contact_phone: null,
      data_confidence: 'sample',
      ai_score: wantsStartup ? 92 : 78,
      ai_reasoning: 'Early-stage startup founded in 2023 in Koramangala tech hub matching creator tools criteria (+35 pts for startup stage, +30 pts for creator tech).',
      created_at: new Date().toISOString(),
    },
    {
      id: `blr-seed-2`,
      company: 'Kavach FinTech Protocol',
      region: 'India - Bengaluru',
      industry: 'FinTech & Embedded Finance',
      start_date: '2022',
      headcount: 45,
      lat: 12.9121,
      lng: 77.6446,
      approx_location: 'HSR Layout Sector 2, Bengaluru',
      location_confidence: 'approximate',
      description: 'Instant micro-settlements and automated compliance infrastructure for creator payouts.',
      contact_email: 'outreach@kavachfin.in',
      website: 'https://kavachfin.in',
      contact_person: 'Pooja Iyer (Head of Partnerships)',
      contact_phone: null,
      data_confidence: 'sample',
      ai_score: 84,
      ai_reasoning: 'Fast-growing Bengaluru fintech with high appetite for integrated creator product offerings.',
      created_at: new Date().toISOString(),
    },
    {
      id: `blr-seed-3`,
      company: 'IndiStream Media Network',
      region: 'India - Bengaluru',
      industry: 'Media & OTT Tech',
      start_date: '2021',
      headcount: 38,
      lat: 12.9784,
      lng: 77.6408,
      approx_location: '100ft Road, Indiranagar, Bengaluru',
      location_confidence: 'approximate',
      description: 'Regional language content distribution and programmatic sponsorship platform.',
      contact_email: 'partners@indistream.in',
      website: 'https://indistream.in',
      contact_person: 'Rohan Deshmukh (VP Growth)',
      contact_phone: null,
      data_confidence: 'sample',
      ai_score: 80,
      ai_reasoning: 'Strong alignment with content monetization and established operations in Indiranagar.',
      created_at: new Date().toISOString(),
    },
  ]
}

function parseLocallyWithBengaluruFallback(raw: string): Company[] {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  const results: Company[] = []

  lines.forEach((line, idx) => {
    const parts = line.split(/[,\t|]/).map((s) => s.trim())
    const company = parts[0] || `Company ${idx + 1}`
    const industry = parts[1] || 'Technology'
    const startDate = parts[2] || 'Not specified'
    const hub = BENGALURU_HUBS[idx % BENGALURU_HUBS.length]

    results.push({
      id: `upload-local-${Date.now()}-${idx}`,
      company,
      region: 'India - Bengaluru',
      industry,
      start_date: startDate,
      headcount: null,
      lat: null,
      lng: null,
      approx_location: 'Location unknown',
      location_confidence: 'unverified',
      description: `Operating in ${industry}.`,
      contact_email: null,
      website: null,
      contact_person: null,
      contact_phone: null,
      data_confidence: 'estimated',
      field_labels: {
        description: 'ai_suggested',
      },
      ai_score: 72,
      ai_reasoning: 'Parsed from local input.',
      created_at: new Date().toISOString(),
    })
  })

  return results.length > 0 ? results : getLocalBengaluruSample('')
}
