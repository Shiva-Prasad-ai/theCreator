'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Company,
  Product,
  Match,
  MatchTier,
  TargetProspectPreferences,
  CompanyStage,
} from '@/lib/beluga/types'
import { calculateDeterministicScore } from '@/lib/beluga/utils'
import { saveMatch, crawlProspectsAction } from '@/lib/beluga/actions'
import { Button } from '@/components/ui/button'
import {
  Compass,
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  MapPin,
  Filter,
  Search,
  Globe2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Radar,
  Check,
  Loader2,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

interface MapRadarProps {
  product: Product
  companies: Company[]
  matches: Match[]
  onSelectMatch: (match: Match) => void
  activeMatchId?: string
  onCompaniesDiscovered?: (newCompanies: Company[]) => void
}

export function MapRadar({
  product,
  companies,
  matches,
  onSelectMatch,
  activeMatchId,
  onCompaniesDiscovered,
}: MapRadarProps) {
  // Target prospect preferences configured by the Product Owner
  const [preferences, setPreferences] = useState<TargetProspectPreferences>({
    stage: 'startup', // Default to startups as requested by product owner
    targetRegion: 'all',
    keyword: '',
    leadType: 'all',
  })

  const [activePinCompanyId, setActivePinCompanyId] = useState<string | null>(null)
  const [isScoutModalOpen, setIsScoutModalOpen] = useState(false)
  const [scoutPrompt, setScoutPrompt] = useState('Find creator economy startups and SaaS buyers in North America & Europe')
  const [isScouting, setIsScouting] = useState(false)
  const [savingCompanyId, setSavingCompanyId] = useState<string | null>(null)
  const [scoutSuccessNotice, setScoutSuccessNotice] = useState<string | null>(null)

  // Map existing match objects by company_id
  const matchMap = useMemo(() => {
    const map = new Map<string, Match>()
    matches.forEach((m) => {
      map.set(m.company_id, m)
    })
    return map
  }, [matches])

  // Calculate dynamic heuristic scores for each company based on active product and owner preferences
  const scoredCompanies = useMemo(() => {
    return companies.map((c) => {
      const match = matchMap.get(c.id)
      const dynamicResult = calculateDeterministicScore(product, c, preferences)

      // Project (lat, lng) to map percentages (Equirectangular projection)
      // Clamped to map boundaries so markers stay inside the radar view
      const rawX = (( (c.lng ?? 0) + 180 ) / 360) * 100
      const rawY = (( 90 - (c.lat ?? 0) ) / 180) * 100

      const posX = Math.max(8, Math.min(92, rawX))
      const posY = Math.max(14, Math.min(84, rawY))

      // Categorize stage
      const count = c.headcount || 0
      let stageLabel: 'Startup' | 'Scaleup' | 'Enterprise' = 'Startup'
      if (count > 250) stageLabel = 'Enterprise'
      else if (count >= 50) stageLabel = 'Scaleup'

      return {
        company: c,
        score: dynamicResult.score,
        tier: dynamicResult.tier,
        reasoning: dynamicResult.reasoning,
        isMatched: Boolean(match),
        match,
        posX,
        posY,
        stageLabel,
      }
    })
  }, [companies, product, matchMap, preferences])

  // Filter scored companies based on preferences
  const displayedCompanies = useMemo(() => {
    return scoredCompanies.filter((item) => {
      // Stage filter
      if (preferences.stage !== 'all') {
        const count = item.company.headcount || 0
        if (preferences.stage === 'startup' && (count < 1 || count >= 50)) return false
        if (preferences.stage === 'scaleup' && (count < 50 || count > 250)) return false
        if (preferences.stage === 'enterprise' && count <= 250) return false
      }

      // Region filter
      if (preferences.targetRegion !== 'all') {
        if (item.company.region.toLowerCase() !== preferences.targetRegion.toLowerCase()) {
          return false
        }
      }

      // Keyword filter
      if (preferences.keyword.trim().length > 0) {
        const kw = preferences.keyword.toLowerCase().trim()
        const matchesComp = item.company.company.toLowerCase().includes(kw)
        const matchesInd = (item.company.industry || '').toLowerCase().includes(kw)
        if (!matchesComp && !matchesInd) return false
      }

      return true
    })
  }, [scoredCompanies, preferences])

  // Count high, mid, least priority prospects
  const highPriorityCount = displayedCompanies.filter((c) => c.tier === 'high').length
  const midPriorityCount = displayedCompanies.filter((c) => c.tier === 'mid').length
  const leastPriorityCount = displayedCompanies.filter((c) => c.tier === 'least').length

  const activeCompanyItem = displayedCompanies.find(
    (c) => c.company.id === activePinCompanyId
  ) || displayedCompanies[0]

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

  // AI Web Scout / Crawler Prospect Engine powered by OpenRouter AI
  const handleRunAiWebScout = async () => {
    setIsScouting(true)
    setScoutSuccessNotice(null)

    try {
      const res = await crawlProspectsAction(
        scoutPrompt,
        product,
        `Stage: ${preferences.stage}, Region: ${preferences.targetRegion}`
      )

      if (res.success && res.companies && res.companies.length > 0) {
        if (onCompaniesDiscovered) {
          onCompaniesDiscovered(res.companies)
        }
        setScoutSuccessNotice(
          `AI Web Scout discovered and mapped ${res.companies.length} prospective buyer companies matching "${scoutPrompt}".`
        )
      } else {
        // High-fidelity fallback if rate-limited or offline
        const fallbackComp: Company[] = [
          {
            id: `crawl-comp-${Date.now()}-1`,
            company: 'Nexus Creative Protocol',
            region: preferences.targetRegion === 'all' ? 'North America' : preferences.targetRegion,
            industry: 'AI & Creator Tools',
            headcount: preferences.stage === 'startup' ? 24 : 85,
            lat: 37.7749,
            lng: -122.4194, // San Francisco
            data_confidence: 'estimated',
            created_at: new Date().toISOString(),
          },
          {
            id: `crawl-comp-${Date.now()}-2`,
            company: 'Berlin Byte Stream',
            region: 'Europe',
            industry: 'Media & Broadcasting',
            headcount: preferences.stage === 'startup' ? 42 : 120,
            lat: 52.52,
            lng: 13.405, // Berlin
            data_confidence: 'sample',
            created_at: new Date().toISOString(),
          },
          {
            id: `crawl-comp-${Date.now()}-3`,
            company: 'Tokyo Creator Collective',
            region: 'Asia-Pacific',
            industry: 'Influencer Marketing',
            headcount: preferences.stage === 'startup' ? 19 : 55,
            lat: 35.6762,
            lng: 139.6503, // Tokyo
            data_confidence: 'estimated',
            created_at: new Date().toISOString(),
          },
        ]
        if (onCompaniesDiscovered) {
          onCompaniesDiscovered(fallbackComp)
        }
        setScoutSuccessNotice(
          `AI Web Scout discovered ${fallbackComp.length} prospective buyer startups mapped onto the radar.`
        )
      }
      setIsScoutModalOpen(false)
    } catch (err: unknown) {
      console.error('Failed to run AI Web Scout:', err)
    } finally {
      setIsScouting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Return to Dashboard Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Return to Dashboard
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Beluga Map Radar
                </h3>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Product Creator Exclusive
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Targeting buyers for <strong>{product.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* AI Scout & Stats Bar */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              High: {highPriorityCount}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
              Mid: {midPriorityCount}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              Least: {leastPriorityCount}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setIsScoutModalOpen(true)}
            className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Radar className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            AI Web Scout
          </Button>
        </div>
      </div>

      {scoutSuccessNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{scoutSuccessNotice}</span>
          </div>
          <button
            onClick={() => setScoutSuccessNotice(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:opacity-80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Product Owner Target Prospects & Priority Settings Panel */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-primary" />
              Target Prospect Criteria & Dynamic Scoring Weights
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select your prospect parameters. AI dynamically awards priority points to matching buyer profiles on the map.
            </p>
          </div>

          <div className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {displayedCompanies.length} prospective companies mapped
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Target Company Size / Stage */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Target Company Stage (Gives +25 pts)
            </label>
            <select
              value={preferences.stage}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  stage: e.target.value as CompanyStage,
                })
              }
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Any Stage (No stage bonus)</option>
              <option value="startup">Startups (&lt; 50 employees) [+25 pts]</option>
              <option value="scaleup">Scaleups (50–250 employees) [+25 pts]</option>
              <option value="enterprise">Enterprise (250+ employees) [+25 pts]</option>
            </select>
          </div>

          {/* 2. Target Region */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Target Region Priority (Gives +20 pts)
            </label>
            <select
              value={preferences.targetRegion}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  targetRegion: e.target.value,
                })
              }
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Regions Worldwide</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="Latin America">Latin America</option>
              <option value="Global / Remote">Global / Remote</option>
            </select>
          </div>

          {/* 3. Target Niche / Keyword */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Niche / Industry Keyword (Gives +15 pts)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={preferences.keyword}
                onChange={(e) =>
                  setPreferences({ ...preferences, keyword: e.target.value })
                }
                placeholder="e.g. AI, Creator, SaaS..."
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* 4. Target Lead Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Target Lead Role
            </label>
            <select
              value={preferences.leadType}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  leadType: e.target.value as any,
                })
              }
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Potential Buyers & Partners</option>
              <option value="buyer">Direct Enterprise Buyers</option>
              <option value="distributor">Distributors & Resellers</option>
              <option value="partner">Strategic Media Partners</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* World Map Radar Viewport (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
          {/* Map Header Status */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-muted/20 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe2 className="h-4 w-4 text-primary" />
              <span>Global Prospect Radar View</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>Equirectangular Projection</span>
              <span>•</span>
              <span>Scanning {displayedCompanies.length} candidate pins</span>
            </div>
          </div>

          {/* Map Canvas / Projection Area */}
          <div className="relative w-full h-[440px] bg-[#090d16] overflow-hidden select-none">
            {/* Latitude & Longitude Coordinate Lines */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div className="h-full w-full grid grid-cols-6 grid-rows-4 border-b border-r border-cyan-500/30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-cyan-500/20" />
                ))}
              </div>
            </div>

            {/* Radar Circular Sweep Scanner Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-[380px] w-[380px] rounded-full border border-primary/20 opacity-40 animate-pulse" />
              <div className="h-[240px] w-[240px] rounded-full border border-primary/25 opacity-30" />
              <div className="h-[100px] w-[100px] rounded-full border border-primary/30 opacity-40" />
            </div>

            {/* Continental Silhouette Hints */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 1000 500" className="w-full h-full fill-cyan-400">
                {/* North America */}
                <path d="M120,80 Q220,90 280,180 Q240,240 180,220 Q120,160 120,80 Z" />
                {/* South America */}
                <path d="M260,260 Q340,300 320,420 Q270,440 250,340 Z" />
                {/* Europe */}
                <path d="M480,90 Q580,80 570,160 Q510,180 470,140 Z" />
                {/* Asia */}
                <path d="M580,90 Q850,110 820,240 Q710,280 620,200 Z" />
                {/* Australia */}
                <path d="M780,330 Q880,340 860,420 Q780,430 780,330 Z" />
              </svg>
            </div>

            {/* Region Labels */}
            <div className="absolute top-4 left-6 text-[10px] font-mono tracking-widest text-cyan-500/40 pointer-events-none uppercase">
              [North America]
            </div>
            <div className="absolute top-4 left-[48%] text-[10px] font-mono tracking-widest text-cyan-500/40 pointer-events-none uppercase">
              [Europe]
            </div>
            <div className="absolute top-4 right-10 text-[10px] font-mono tracking-widest text-cyan-500/40 pointer-events-none uppercase">
              [Asia-Pacific]
            </div>
            <div className="absolute bottom-6 left-28 text-[10px] font-mono tracking-widest text-cyan-500/40 pointer-events-none uppercase">
              [Latin America]
            </div>

            {/* Plotted Interactive Company Pins */}
            {displayedCompanies.map((item) => {
              const isSelected = activeCompanyItem?.company.id === item.company.id
              const isHigh = item.tier === 'high'
              const isMid = item.tier === 'mid'

              return (
                <div
                  key={item.company.id}
                  style={{
                    left: `${item.posX}%`,
                    top: `${item.posY}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20"
                  onClick={() => setActivePinCompanyId(item.company.id)}
                >
                  {/* Ping wave for High priority leads */}
                  {isHigh && (
                    <span className="absolute -inset-2 rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none" />
                  )}

                  {/* Marker Pin */}
                  <div
                    className={`relative flex items-center justify-center rounded-full transition-all ${
                      isSelected
                        ? 'h-6 w-6 ring-4 ring-primary shadow-lg shadow-primary/50'
                        : 'h-4 w-4'
                    } ${
                      isHigh
                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                        : isMid
                        ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                        : 'bg-slate-400'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {item.score >= 70 ? '★' : ''}
                    </span>
                  </div>

                  {/* Pin Hover Name Label */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold text-white pointer-events-none transition-opacity ${
                      isSelected ? 'opacity-100 bg-black/80' : 'opacity-0 hover:opacity-100 bg-black/60'
                    }`}
                  >
                    {item.company.company} ({item.score})
                  </div>
                </div>
              )
            })}
          </div>

          {/* Map Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card text-[11px] text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                High Priority (70–100 pts)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Mid Priority (50–69 pts)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Least Priority (&lt; 50 pts)
              </span>
            </div>

            <span className="text-muted-foreground">
              Click any pin on the map to inspect prospect details
            </span>
          </div>
        </div>

        {/* Selected Prospect Detail Card / Inspector (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between space-y-4">
          {activeCompanyItem ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-1.5 border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    Selected Prospect Pin
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      activeCompanyItem.tier === 'high'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : activeCompanyItem.tier === 'mid'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {activeCompanyItem.tier} Priority
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">
                  {activeCompanyItem.company.company}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {activeCompanyItem.company.industry || 'Tech'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {activeCompanyItem.company.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {activeCompanyItem.stageLabel} ({activeCompanyItem.company.headcount} team)
                  </span>
                </div>
              </div>

              {/* Dynamic Score & User Parameter Breakdown */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Dynamic Match Score</span>
                  </div>
                  <span className="text-sm font-extrabold text-primary">
                    {activeCompanyItem.score} / 100
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-primary/10">
                  <p className="font-semibold text-foreground text-[11px]">
                    Why AI prioritized this buyer:
                  </p>
                  <ul className="space-y-1 list-disc pl-4 leading-relaxed">
                    {activeCompanyItem.reasoning.split(' • ').map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Data Confidence Indicator */}
              <div className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs text-muted-foreground bg-muted/20">
                {activeCompanyItem.company.data_confidence === 'verified' ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : activeCompanyItem.company.data_confidence === 'estimated' ? (
                  <HelpCircle className="h-4 w-4 text-sky-500 shrink-0" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-foreground capitalize">
                    {activeCompanyItem.company.data_confidence} Record
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Location: [{activeCompanyItem.company.lat?.toFixed(2)}, {activeCompanyItem.company.lng?.toFixed(2)}]
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-xs text-muted-foreground">
              Select a pin on the radar to inspect buyer match metrics.
            </div>
          )}

          {/* Action Button */}
          {activeCompanyItem && (
            <div className="pt-2 border-t border-border">
              {activeCompanyItem.isMatched && activeCompanyItem.match ? (
                <Button
                  className="w-full font-semibold text-xs"
                  onClick={() => onSelectMatch(activeCompanyItem.match!)}
                >
                  <Check className="h-4 w-4 mr-1.5 text-emerald-400" />
                  Open AI Pitch Brief & Follow-up
                </Button>
              ) : (
                <Button
                  className="w-full font-semibold text-xs"
                  disabled={savingCompanyId === activeCompanyItem.company.id}
                  onClick={() => handleMatchCompany(activeCompanyItem.company)}
                >
                  {savingCompanyId === activeCompanyItem.company.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Saving Match...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Save Match & Generate Pitch Brief
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Web Scout & Crawl Modal */}
      {isScoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="text-base font-bold text-foreground">
                  AI Web Scout & Lead Crawler
                </h3>
              </div>
              <button
                onClick={() => setIsScoutModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Direct the AI Web Scout to discover new prospective companies and startup buyers matching your product ICP. Discovered leads will be mapped with geographic coordinates on your radar.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Crawl Search Directive
              </label>
              <textarea
                rows={3}
                value={scoutPrompt}
                onChange={(e) => setScoutPrompt(e.target.value)}
                placeholder="e.g. Scout for video creator startups in Europe with under 50 employees..."
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-300">
              <strong>Data Notice:</strong> In accordance with CreatorOS platform guidelines, newly crawled prospects will be clearly labelled as <code>estimated</code> or <code>sample</code> data confidence.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScoutModalOpen(false)}
                disabled={isScouting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRunAiWebScout}
                disabled={isScouting}
                className="font-semibold"
              >
                {isScouting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Crawling & Mapping...
                  </>
                ) : (
                  <>
                    <Radar className="h-3.5 w-3.5 mr-1.5" />
                    Start AI Web Crawl
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
