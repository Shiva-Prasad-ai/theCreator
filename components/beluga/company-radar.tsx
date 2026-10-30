'use client'

import React, { useState, useMemo } from 'react'
import {
  Company,
  Product,
  Match,
  MatchTier,
  DataConfidence,
  BelugaFilterState,
} from '@/lib/beluga/types'
import {
  saveMatch,
  updateMatchTier,
} from '@/lib/beluga/actions'
import { calculateDeterministicScore } from '@/lib/beluga/utils'
import { Button } from '@/components/ui/button'
import {
  Search,
  Filter,
  Check,
  Sparkles,
  Building2,
  Users,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Loader2,
} from 'lucide-react'

interface CompanyRadarProps {
  product: Product
  companies: Company[]
  matches: Match[]
  onSelectMatch: (match: Match) => void
  activeMatchId?: string
}

export function CompanyRadar({
  product,
  companies,
  matches,
  onSelectMatch,
  activeMatchId,
}: CompanyRadarProps) {
  const [filters, setFilters] = useState<BelugaFilterState>({
    searchQuery: '',
    tier: 'all',
    region: 'all',
    industry: 'all',
    dataConfidence: 'all',
  })

  const [savingCompanyId, setSavingCompanyId] = useState<string | null>(null)

  // Map companyId to saved Match
  const matchMap = useMemo(() => {
    const map = new Map<string, Match>()
    matches.forEach((m) => {
      map.set(m.company_id, m)
    })
    return map
  }, [matches])

  // Extract unique regions and industries from company dataset
  const availableRegions = useMemo(() => {
    const set = new Set<string>()
    companies.forEach((c) => {
      if (c.region) set.add(c.region)
    })
    return Array.from(set)
  }, [companies])

  const availableIndustries = useMemo(() => {
    const set = new Set<string>()
    companies.forEach((c) => {
      if (c.industry) set.add(c.industry)
    })
    return Array.from(set)
  }, [companies])

  // Compute scores and filter companies
  const filteredScoredCompanies = useMemo(() => {
    return companies
      .map((company) => {
        const scoreResult = calculateDeterministicScore(product, company)
        const savedMatch = matchMap.get(company.id)
        const activeTier = savedMatch?.tier || scoreResult.tier

        return {
          company,
          score: savedMatch?.score ?? scoreResult.score,
          tier: activeTier,
          reasoning: savedMatch?.reasoning || scoreResult.reasoning,
          isMatched: !!savedMatch,
          match: savedMatch,
        }
      })
      .filter((item) => {
        // Search filter
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase()
          const nameMatch = item.company.company.toLowerCase().includes(q)
          const indMatch = (item.company.industry || '').toLowerCase().includes(q)
          if (!nameMatch && !indMatch) return false
        }

        // Tier filter
        if (filters.tier !== 'all' && item.tier !== filters.tier) {
          return false
        }

        // Region filter
        if (filters.region !== 'all' && item.company.region !== filters.region) {
          return false
        }

        // Industry filter
        if (filters.industry !== 'all' && item.company.industry !== filters.industry) {
          return false
        }

        // Data confidence filter
        if (
          filters.dataConfidence !== 'all' &&
          item.company.data_confidence !== filters.dataConfidence
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
  }, [companies, product, matchMap, filters])

  const handleMatchCompany = async (company: Company) => {
    setSavingCompanyId(company.id)
    try {
      const res = await saveMatch(product.id, company.id, product, company)
      if (res.success && res.match) {
        onSelectMatch(res.match)
      }
    } finally {
      setSavingCompanyId(null)
    }
  }

  const handleTierChange = async (matchId: string, newTier: MatchTier) => {
    await updateMatchTier(matchId, newTier)
  }

  const getConfidenceBadge = (confidence: DataConfidence) => {
    switch (confidence) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            Verified Record
          </span>
        )
      case 'estimated':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
            <HelpCircle className="h-3 w-3" />
            Estimated Data
          </span>
        )
      case 'sample':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-3 w-3" />
            Sample Reference
          </span>
        )
    }
  }

  const getTierBadge = (tier: MatchTier) => {
    switch (tier) {
      case 'high':
        return (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            High Priority
          </span>
        )
      case 'mid':
        return (
          <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Mid Priority
          </span>
        )
      case 'least':
      default:
        return (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border">
            Least Priority
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search companies, domain keywords, or industries..."
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tier Selector */}
            <select
              value={filters.tier}
              onChange={(e) =>
                setFilters({ ...filters, tier: e.target.value as 'all' | MatchTier })
              }
              className="rounded-lg border border-input bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="high">High Tier</option>
              <option value="mid">Mid Tier</option>
              <option value="least">Least Tier</option>
            </select>

            {/* Region Selector */}
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="rounded-lg border border-input bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Regions</option>
              {availableRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Confidence Selector */}
            <select
              value={filters.dataConfidence}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dataConfidence: e.target.value as 'all' | DataConfidence,
                })
              }
              className="rounded-lg border border-input bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Confidence</option>
              <option value="sample">Sample Only</option>
              <option value="estimated">Estimated</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
          <span>
            Showing <strong>{filteredScoredCompanies.length}</strong> matching candidate records
          </span>
          <span className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Ranked by deterministic compatibility score
          </span>
        </div>
      </div>

      {/* Candidate Company Cards */}
      <div className="space-y-3">
        {filteredScoredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <h4 className="font-semibold text-foreground text-sm">No companies match filters</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search criteria, tier filter, or clearing keyword restrictions.
            </p>
          </div>
        ) : (
          filteredScoredCompanies.map((item) => {
            const isSelected = activeMatchId === item.match?.id
            const isSaving = savingCompanyId === item.company.id

            return (
              <div
                key={item.company.id}
                className={`rounded-2xl border transition-all p-5 ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Company Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-foreground">
                        {item.company.company}
                      </h4>
                      {getConfidenceBadge(item.company.data_confidence)}
                      {getTierBadge(item.tier)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.company.industry || 'Industry unspecified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.company.region}
                      </span>
                      {item.company.headcount && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.company.headcount} employees
                        </span>
                      )}
                    </div>

                    {/* Deterministic Reasoning */}
                    <div className="mt-2.5 rounded-lg border border-border/80 bg-background/80 p-2.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-1.5 font-semibold text-foreground text-[11px] mb-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span>Heuristic score: {item.score} / 100</span>
                        </div>
                        <div
                          className="group relative cursor-help"
                          title="1. Industry Alignment (up to 35 pts)&#10;2. ICP & Keyword Match (up to 25 pts)&#10;3. Headcount Scale Suitability (up to 15 pts)&#10;4. Data Confidence Bonus (+5 pts)"
                        >
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                            <HelpCircle className="h-3 w-3" />
                            Factors
                          </span>
                          <div className="absolute right-0 bottom-full mb-2 hidden w-64 rounded-lg border border-border bg-popover p-2.5 text-[11px] text-popover-foreground shadow-md group-hover:block z-50">
                            <p className="font-bold text-foreground mb-1 text-[11px]">Heuristic Score Factors:</p>
                            <ul className="space-y-1 text-[10px] text-muted-foreground">
                              <li>• <strong>Industry alignment:</strong> Up to 35 pts for matching or adjacent sectors</li>
                              <li>• <strong>ICP & keywords:</strong> Up to 25 pts for value prop keyword hits</li>
                              <li>• <strong>Headcount scale:</strong> Up to 15 pts for team size adoption fit</li>
                              <li>• <strong>Data confidence:</strong> +5 pts bonus for verified reference records</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {item.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-2 sm:pt-0 border-t border-border/60 sm:border-t-0">
                    {item.isMatched && item.match ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => onSelectMatch(item.match!)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                          {isSelected ? 'Viewing Match' : 'Open Match Brief'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={() => handleMatchCompany(item.company)}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            Matching...
                          </>
                        ) : (
                          'Save Match & Pitch'
                        )}
                      </Button>
                    )}

                    {item.isMatched && item.match && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span>Tier:</span>
                        <select
                          value={item.tier}
                          onChange={(e) =>
                            handleTierChange(item.match!.id, e.target.value as MatchTier)
                          }
                          className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
                        >
                          <option value="high">High</option>
                          <option value="mid">Mid</option>
                          <option value="least">Least</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
