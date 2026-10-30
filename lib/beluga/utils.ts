import {
  Product,
  Company,
  PitchBrief,
  MatchScoreResult,
  MatchTier,
  TargetProspectPreferences,
} from './types'

/**
 * Deterministic and explainable relevance scoring.
 * Based on industry overlap, ICP keywords, team headcount scale, data confidence,
 * and Product Owner target prospect preferences.
 */
export function calculateDeterministicScore(
  product: Product,
  company: Company,
  preferences?: TargetProspectPreferences
): MatchScoreResult {
  let score = 20
  const reasons: string[] = []

  const prodInd = (product.industry || '').toLowerCase().trim()
  const compInd = (company.industry || '').toLowerCase().trim()

  // 1. Industry Alignment (up to 35 pts)
  if (prodInd && compInd) {
    if (prodInd === compInd) {
      score += 35
      reasons.push(`Direct industry match in "${company.industry}" (+35)`)
    } else {
      const prodWords = prodInd.split(/[\s,&/]+/)
      const matchWord = prodWords.find((w) => w.length > 2 && compInd.includes(w))
      if (matchWord) {
        score += 25
        reasons.push(`Adjacent sector synergy around "${matchWord}" (+25)`)
      }
    }
  }

  // 2. ICP & Value Proposition Keyword Match (up to 25 pts)
  const icpText = `${product.icp || ''} ${product.description || ''}`.toLowerCase()
  const compNameWords = company.company.toLowerCase().split(/\s+/)
  const keywordHits: string[] = []

  compNameWords.forEach((word) => {
    if (word.length > 3 && icpText.includes(word)) {
      keywordHits.push(word)
    }
  })

  if (compInd) {
    compInd.split(/[\s,&/]+/).forEach((word) => {
      if (word.length > 3 && icpText.includes(word) && !keywordHits.includes(word)) {
        keywordHits.push(word)
      }
    })
  }

  if (keywordHits.length > 0) {
    const pts = Math.min(25, keywordHits.length * 10)
    score += pts
    reasons.push(`ICP text alignment on keywords [${keywordHits.slice(0, 3).join(', ')}] (+${pts})`)
  }

  // 3. Headcount scale suitability (up to 15 pts)
  const count = company.headcount || 0
  if (count >= 10 && count <= 150) {
    score += 15
    reasons.push(`Ideal team size (${count} employees) for fast creator tool adoption (+15)`)
  } else if (count > 150) {
    score += 10
    reasons.push(`Enterprise buyer scale (${count} employees) (+10)`)
  } else if (count > 0) {
    score += 5
    reasons.push(`Boutique team (${count} employees) (+5)`)
  }

  // 4. Data confidence bonus
  if (company.data_confidence === 'verified') {
    score += 5
    reasons.push('Verified reference record (+5)')
  }

  // 5. Product Owner Target Prospect Preferences & Priority Settings
  if (preferences) {
    // Stage / Company Scale Preference (e.g. Startups get priority point)
    if (preferences.stage === 'startup') {
      if (count > 0 && count < 50) {
        score += 25
        reasons.push(`Target Match: Startup tier (${count} employees) (+25)`)
      }
    } else if (preferences.stage === 'scaleup') {
      if (count >= 50 && count <= 250) {
        score += 25
        reasons.push(`Target Match: Scaleup tier (${count} employees) (+25)`)
      }
    } else if (preferences.stage === 'enterprise') {
      if (count > 250) {
        score += 25
        reasons.push(`Target Match: Enterprise tier (${count} employees) (+25)`)
      }
    }

    // Target Region Preference
    if (
      preferences.targetRegion &&
      preferences.targetRegion !== 'all' &&
      company.region.toLowerCase() === preferences.targetRegion.toLowerCase()
    ) {
      score += 20
      reasons.push(`Target Region Priority: Located in "${company.region}" (+20)`)
    }

    // Target Keyword / Niche Preference
    if (preferences.keyword && preferences.keyword.trim().length > 0) {
      const kw = preferences.keyword.toLowerCase().trim()
      const matchComp = company.company.toLowerCase().includes(kw)
      const matchInd = (company.industry || '').toLowerCase().includes(kw)
      if (matchComp || matchInd) {
        score += 15
        reasons.push(`Keyword Target Hit: Matches "${preferences.keyword}" (+15)`)
      }
    }
  }

  const finalScore = Math.min(100, Math.max(10, score))
  let tier: MatchTier = 'least'
  if (finalScore >= SCORE_THRESHOLD_HIGH) {
    tier = 'high'
  } else if (finalScore >= SCORE_THRESHOLD_MID) {
    tier = 'mid'
  }

  return {
    score: finalScore,
    tier,
    reasoning: reasons.join(' • '),
  }
}

export const SCORE_THRESHOLD_HIGH = 70
export const SCORE_THRESHOLD_MID = 40

/**
 * Safely parse a brief stored in matches.brief
 */
export function parseBrief(raw: string | null | undefined): PitchBrief | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && 'opening_line' in parsed) {
      return {
        opening_line: parsed.opening_line || '',
        talking_points: Array.isArray(parsed.talking_points) ? parsed.talking_points : [],
        objection: parsed.objection || '',
        reply: parsed.reply || '',
        updated_at: parsed.updated_at,
        is_manual: parsed.is_manual ?? false,
      }
    }
  } catch {
    // If stored as legacy plain string
    return {
      opening_line: raw,
      talking_points: [],
      objection: '',
      reply: '',
      is_manual: true,
    }
  }

  return null
}

/**
 * Validate coordinates inside India's bounding box.
 * Auto-corrects swapped [longitude, latitude].
 * Returns [lat, lng] if valid in India, or null if missing or outside India.
 * Note: Never clamps invalid coordinates to Bengaluru.
 */
export function getValidIndiaCoords(
  rawLat?: number | null,
  rawLng?: number | null
): [number, number] | null {
  if (typeof rawLat !== 'number' || isNaN(rawLat) || typeof rawLng !== 'number' || isNaN(rawLng)) {
    return null
  }

  const INDIA_LAT_MIN = 8.0
  const INDIA_LAT_MAX = 37.0
  const INDIA_LNG_MIN = 68.0
  const INDIA_LNG_MAX = 97.0

  let lat = rawLat
  let lng = rawLng

  // Detect and fix inverted [longitude, latitude]
  if (lat >= INDIA_LNG_MIN && lat <= INDIA_LNG_MAX && lng >= INDIA_LAT_MIN && lng <= INDIA_LAT_MAX) {
    const temp = lat
    lat = lng
    lng = temp
  }

  // If outside India bounding box, do NOT clamp. Return null (no pin).
  if (lat < INDIA_LAT_MIN || lat > INDIA_LAT_MAX || lng < INDIA_LNG_MIN || lng > INDIA_LNG_MAX) {
    return null
  }

  return [lat, lng]
}
