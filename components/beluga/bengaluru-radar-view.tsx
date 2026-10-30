'use client'

import React, { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Company,
  Product,
  ColdPitchDraft,
} from '@/lib/beluga/types'
import { getValidIndiaCoords } from '@/lib/beluga/utils'
import {
  crawlProspectsAction,
  parseUploadedDataAction,
  scoreProspectDynamicAction,
  generateColdOutreachAction,
} from '@/lib/beluga/actions'
import { updatePersona } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Sparkles,
  Building2,
  MapPin,
  Upload,
  FileSpreadsheet,
  FileText,
  Globe2,
  Mail,
  User,
  Calendar,
  Check,
  Copy,
  Edit3,
  Loader2,
  X,
  ExternalLink,
  Compass,
  TrendingUp,
  Sliders,
  Send,
} from 'lucide-react'

// Dynamically import OpenMap to prevent SSR leaflet window errors
const BengaluruOpenMap = dynamic(
  () =>
    import('./bengaluru-open-map').then((mod) => mod.BengaluruOpenMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] w-full items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading OpenStreetMap Bengaluru Radar...</span>
        </div>
      </div>
    ),
  }
)

interface BengaluruRadarViewProps {
  product: Product
  initialCompanies: Company[]
  currentPersona: string
}

export function BengaluruRadarView({
  product,
  initialCompanies,
  currentPersona,
}: BengaluruRadarViewProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    initialCompanies[0] || null
  )

  // Dynamic user preferences for AI scoring (NO hardcoded logic)
  const [userPreferences, setUserPreferences] = useState(
    'Find early-stage startups founded after 2021 in Bengaluru with focus on AI, Creator Tools, or FinTech'
  )
  const [isScoringAll, setIsScoringAll] = useState(false)

  // Modals & Upload
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [rawUploadText, setRawUploadText] = useState('')
  const [isParsingUpload, setIsParsingUpload] = useState(false)
  const [uploadFileName, setUploadFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle CSV / Excel / text file selection
  const handleFileSelected = async (file: File) => {
    setUploadFileName(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'xlsx' || ext === 'xls') {
      const { read, utils } = await import('xlsx')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const csv = utils.sheet_to_csv(firstSheet)
      setRawUploadText(csv)
    } else {
      const text = await file.text()
      setRawUploadText(text)
    }
  }

  const [isScoutOpen, setIsScoutOpen] = useState(false)
  const [scoutDirective, setScoutDirective] = useState(
    'Find promising AI, SaaS, and Creator Tech startups in Bengaluru seeking automated partnership and growth tools'
  )
  const [isScouting, setIsScouting] = useState(false)

  // Cold Outreach Pitch state
  const [isColdOutreachOpen, setIsColdOutreachOpen] = useState(false)
  const [isGeneratingColdPitch, setIsGeneratingColdPitch] = useState(false)
  const [coldDraft, setColdDraft] = useState<ColdPitchDraft | null>(null)
  const [isEditingDraft, setIsEditingDraft] = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Status message
  const [statusNotice, setStatusNotice] = useState<string | null>(null)

  // Persona switch transition
  const [isSwitchingPersona, startPersonaTransition] = useTransition()

  // Persona Exclusivity Check
  const isProductCreator = currentPersona === 'product_creator'

  if (!isProductCreator) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6">
            <Compass className="h-8 w-8 animate-pulse" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
            Exclusive to Product Creators
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Beluga B2B Prospect Radar
          </h1>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Beluga is purpose-built for Product Creators to map potential buyer startups across Bengaluru and India, evaluate prospective leads with AI preference scoring, and craft tailored cold outreach pitches.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => {
                startPersonaTransition(async () => {
                  await updatePersona('product_creator')
                  window.location.reload()
                })
              }}
              disabled={isSwitchingPersona}
              className="w-full sm:w-auto"
            >
              {isSwitchingPersona ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching Workspace...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Switch to Product Creator Workspace
                </>
              )}
            </Button>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Handle Dynamic AI Preference Scoring across all mapped companies
  const handleScoreWithAi = async () => {
    if (!userPreferences.trim()) return
    setIsScoringAll(true)
    setStatusNotice(null)

    try {
      const updated = await Promise.all(
        companies.map(async (company) => {
          const res = await scoreProspectDynamicAction(
            product,
            company,
            userPreferences
          )
          if (res.success) {
            return {
              ...company,
              ai_score: res.score,
              ai_reasoning: res.reasoning,
              ai_points_breakdown: res.points_breakdown,
            }
          }
          return company
        })
      )

      setCompanies(updated)
      if (selectedCompany) {
        const found = updated.find((c) => c.id === selectedCompany.id)
        if (found) setSelectedCompany(found)
      }
      setStatusNotice(
        `AI dynamically evaluated ${updated.length} prospects according to your custom preferences.`
      )
    } finally {
      setIsScoringAll(false)
    }
  }

  // Handle Upload Data & AI Missing Data Error Fixer
  const handleUploadData = async () => {
    if (!rawUploadText.trim()) return
    setIsParsingUpload(true)
    setStatusNotice(null)

    try {
      const res = await parseUploadedDataAction(
        rawUploadText,
        product,
        userPreferences
      )
      if (res.success && res.companies.length > 0) {
        setCompanies((prev) => [...res.companies, ...prev])
        setSelectedCompany(res.companies[0])
        setStatusNotice(
          `Successfully processed ${res.companies.length} uploaded companies. AI normalized fields, resolved approximate Bengaluru coordinates, and handled missing values without dummy data.`
        )
        setIsUploadOpen(false)
        setRawUploadText('')
      } else {
        setStatusNotice(res.error || 'Failed to parse uploaded data.')
      }
    } finally {
      setIsParsingUpload(false)
    }
  }

  // Handle Web Crawling / AI Scout in Bengaluru
  const handleRunAiWebScout = async () => {
    setIsScouting(true)
    setStatusNotice(null)

    try {
      const res = await crawlProspectsAction(
        scoutDirective,
        product,
        userPreferences
      )
      if (res.success && res.companies.length > 0) {
        setCompanies((prev) => [...res.companies, ...prev])
        setSelectedCompany(res.companies[0])
        setStatusNotice(
          `AI Suggestions generated and listed ${res.companies.length} potential buyer prospects.`
        )
        setIsScoutOpen(false)
      } else {
        setStatusNotice(res.error || 'AI Suggestions completed with sample leads.')
      }
    } finally {
      setIsScouting(false)
    }
  }

  // Open Cold Outreach Pitch Modal & Generate with AI
  const handleOpenColdOutreach = async (company: Company) => {
    setSelectedCompany(company)
    setIsColdOutreachOpen(true)
    setIsGeneratingColdPitch(true)
    setIsEditingDraft(false)
    setCopySuccess(false)

    try {
      const res = await generateColdOutreachAction(product, company)
      if (res.success && res.draft) {
        setColdDraft(res.draft)
        setEditedSubject(res.draft.subject)
        setEditedBody(res.draft.full_body)
      }
    } finally {
      setIsGeneratingColdPitch(false)
    }
  }

  const handleCopyColdEmail = () => {
    const textToCopy = `Subject: ${editedSubject}\n\n${editedBody}`
    navigator.clipboard.writeText(textToCopy)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Return to Dashboard Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Return to Dashboard
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Beluga B2B Prospect Radar
              </h1>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-semibold">
                Product Creator Exclusive
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Base: India &amp; Bengaluru Tech Corridor • OpenStreetMap Engine
            </p>
          </div>
        </div>

        {/* Action Controls: Upload & Web Scout */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="text-xs"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload Data
          </Button>

          <Button
            size="sm"
            onClick={() => setIsScoutOpen(true)}
            className="text-xs shadow-sm"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            AI Suggestions
          </Button>
        </div>
      </div>

      {/* Status Notice Banner */}
      {statusNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="rounded p-1 text-muted-foreground hover:bg-emerald-500/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* User Preferences & Dynamic AI Scoring Toolbar (NO HARDCODED LOGIC) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <label className="text-xs font-semibold text-foreground">
                Target Prospect Preferences (AI Dynamic Scoring Directive)
              </label>
              <span className="text-[10px] text-muted-foreground">
                (AI awards points dynamically based on your criteria, not hardcoded formulas)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userPreferences}
                onChange={(e) => setUserPreferences(e.target.value)}
                placeholder="e.g. Find early-stage startups founded after 2021 in Bengaluru with focus on Creator Tools or FinTech"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScoreWithAi}
              disabled={isScoringAll}
              className="text-xs"
            >
              {isScoringAll ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Scoring with AI...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                  Calculate AI Scores
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: OpenStreetMap (Bengaluru) + Prospect Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OpenStreetMap Base Component */}
        <div className="lg:col-span-8 min-h-[520px]">
          <BengaluruOpenMap
            companies={companies}
            selectedCompanyId={selectedCompany?.id || null}
            onSelectCompany={(comp) => setSelectedCompany(comp)}
          />
        </div>

        {/* Selected Prospect Details Card */}
        <div className="lg:col-span-4 space-y-4">
          {selectedCompany ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              {/* Header & Score Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedCompany.company}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{selectedCompany.industry || 'Nature not specified'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      (selectedCompany.ai_score ?? 75) >= 75
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : (selectedCompany.ai_score ?? 75) >= 50
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    <span>{selectedCompany.ai_score ?? 75}/100</span>
                    <span className="text-[10px] font-medium">pts</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    AI Preference Score
                  </div>
                </div>
              </div>

              {/* Core Parameters Display */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Start Date / Founded
                  </div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {selectedCompany.start_date || 'Not specified'}
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Headcount
                  </div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {selectedCompany.headcount
                      ? `${selectedCompany.headcount} team members`
                      : 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Company Description</span>
                  {selectedCompany.field_labels?.description === 'ai_suggested' && (
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-400 normal-case">
                      Unverified
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed bg-background p-2.5 rounded-xl border border-border">
                  {selectedCompany.description ||
                    'No description provided for this prospect.'}
                </p>
              </div>

              {/* Location & Coordinates */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Location &amp; Coordinates
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {getValidIndiaCoords(selectedCompany.lat, selectedCompany.lng)
                        ? (selectedCompany.approx_location || 'Bengaluru, Karnataka, India')
                        : 'Location unknown'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {getValidIndiaCoords(selectedCompany.lat, selectedCompany.lng)
                      ? `${selectedCompany.lat?.toFixed(3)}, ${selectedCompany.lng?.toFixed(3)}`
                      : 'No map pin'}
                  </span>
                </div>
              </div>

              {/* Contact Details (Honest handling without dummy data) */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact Details
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-2.5 py-1.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                      {selectedCompany.field_labels?.contact_email === 'ai_suggested' && (
                        <span className="ml-1 rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.2 text-[8px] font-semibold text-amber-700 dark:text-amber-400">
                          Unverified
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-foreground">
                      {selectedCompany.contact_email || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-2.5 py-1.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Globe2 className="h-3 w-3" />
                      Website
                      {selectedCompany.field_labels?.website === 'ai_suggested' && (
                        <span className="ml-1 rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.2 text-[8px] font-semibold text-amber-700 dark:text-amber-400">
                          Unverified
                        </span>
                      )}
                    </span>
                    {selectedCompany.website &&
                    selectedCompany.website !== 'Not specified' ? (
                      <a
                        href={
                          selectedCompany.website.startsWith('http')
                            ? selectedCompany.website
                            : `https://${selectedCompany.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedCompany.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-2.5 py-1.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Key Contact
                      {selectedCompany.field_labels?.contact_person === 'ai_suggested' && (
                        <span className="ml-1 rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.2 text-[8px] font-semibold text-amber-700 dark:text-amber-400">
                          Unverified
                        </span>
                      )}
                    </span>
                    <span className="text-foreground">
                      {selectedCompany.contact_person || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Preference Points Reasoning */}
              {selectedCompany.ai_reasoning && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Evaluation Breakdown</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {selectedCompany.ai_reasoning}
                  </p>
                  {selectedCompany.ai_points_breakdown &&
                    selectedCompany.ai_points_breakdown.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {selectedCompany.ai_points_breakdown.map((pt, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-primary/20 bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-foreground"
                          >
                            +{pt.points} pts: {pt.criterion}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Trigger Cold Email / Outreach Pitch */}
              <Button
                onClick={() => handleOpenColdOutreach(selectedCompany)}
                className="w-full text-xs"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Write AI Cold Outreach Email
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Map Radar Ready (India / Bengaluru)
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Hardcoded data removed. Upload a CSV or Excel sheet, or generate AI Suggestions to discover buyer prospects and enrich their contact details &amp; descriptions.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUploadOpen(true)}
                  className="text-xs"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload CSV/Excel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsScoutOpen(true)}
                  className="text-xs"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  AI Suggestions
                </Button>
              </div>
            </div>
          )}

          {/* Quick List of All Mapped Prospects */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Mapped Prospects ({companies.length})</span>
              <span className="text-[10px] text-muted-foreground">India • Bengaluru</span>
            </div>
            {companies.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-muted-foreground">
                No prospects mapped yet. Upload a CSV/Excel file or generate AI Suggestions.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompany(c)}
                    className={`w-full text-left rounded-xl border p-2 text-xs transition-colors flex items-center justify-between ${
                      selectedCompany?.id === c.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-foreground truncate">
                        {c.company}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {c.industry || 'Technology'} • {getValidIndiaCoords(c.lat, c.lng) ? (c.approx_location || 'Bengaluru') : 'Location unknown'}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        (c.ai_score ?? 75) >= 75
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {c.ai_score ?? 75} pts
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Upload Data (CSV, Excel, Paste) + AI Enricher */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Upload Prospect Data
                </h3>
                <p className="text-xs text-muted-foreground">
                  Accepts .csv, .xlsx, .xls or paste raw text.
                  Core fields: Company Name, Nature/Industry, Start Date.
                </p>
              </div>
              <button
                onClick={() => { setIsUploadOpen(false); setUploadFileName(null); setRawUploadText('') }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drag-and-drop file zone */}
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-5 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFileSelected(file)
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelected(file)
                }}
              />
              {uploadFileName ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>{uploadFileName} loaded</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <FileSpreadsheet className="h-7 w-7 text-emerald-500" />
                    <FileText className="h-7 w-7 text-blue-500" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Drag &amp; drop or click to upload</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">.csv &nbsp;·&nbsp; .xlsx &nbsp;·&nbsp; .xls &nbsp;·&nbsp; .txt</p>
                </>
              )}
            </div>

            {/* Paste fallback */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Or paste raw data:
              </label>
              <textarea
                rows={4}
                value={rawUploadText}
                onChange={(e) => { setRawUploadText(e.target.value); if (e.target.value) setUploadFileName(null) }}
                placeholder={'Company Name, Industry, Start Year\nZenith AI Labs, Creator Tech, 2023\nKavach Systems, FinTech, 2022'}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <p className="text-[11px] text-muted-foreground">
              💡 AI enriches each company — resolves missing coordinates to Bengaluru hubs, fetches real contact details and writes descriptions. Missing data shows as <em>Not found</em>, never fake dummy data.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setIsUploadOpen(false); setUploadFileName(null); setRawUploadText('') }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUploadData}
                disabled={isParsingUpload || !rawUploadText.trim()}
              >
                {isParsingUpload ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    AI Enriching &amp; Geocoding...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Process &amp; Pin to India Map
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: AI Suggestions in Bengaluru */}
      {isScoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground">
                  AI Suggestions (India &amp; Bengaluru)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Model-suggested prospective buyer companies based on your product parameters and ICP.
                </p>
              </div>
              <button
                onClick={() => setIsScoutOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Suggestion Directive:
              </label>
              <textarea
                rows={3}
                value={scoutDirective}
                onChange={(e) => setScoutDirective(e.target.value)}
                placeholder="What kinds of companies or startups in Bengaluru do you want AI to suggest?"
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1">
              <div className="font-medium text-foreground">Target Base:</div>
              <div className="text-muted-foreground text-[11px]">
                Koramangala, Indiranagar, HSR Layout, Whitefield, Electronic City, Bellandur, Central Bengaluru.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScoutOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRunAiWebScout}
                disabled={isScouting}
              >
                {isScouting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Generating AI Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: AI Cold Email & Pitch Section with Edit Option */}
      {isColdOutreachOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  <span>AI Cold Outreach &amp; Pitch</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Neutral cold pitch tailored for {selectedCompany?.company}
                </p>
              </div>
              <button
                onClick={() => setIsColdOutreachOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isGeneratingColdPitch ? (
              <div className="flex h-48 flex-col items-center justify-center space-y-2 text-center text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Generating tailored cold outreach email with AI...</span>
              </div>
            ) : coldDraft ? (
              <div className="space-y-4">
                {/* How it can be useful & Why choose us explanations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                    <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                      💡 How It Can Be Useful:
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {coldDraft.how_it_is_useful}
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1">
                    <div className="font-semibold text-primary">
                      ⭐ Why Choose Us:
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {coldDraft.why_choose_us}
                    </p>
                  </div>
                </div>

                {/* Email Draft / Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Subject Line:
                    </label>
                    <button
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      {isEditingDraft ? 'Done Editing' : 'Edit Email'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    readOnly={!isEditingDraft}
                    className={`w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground ${
                      isEditingDraft
                        ? 'bg-background ring-1 ring-primary'
                        : 'bg-muted/40'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Email Body:
                  </label>
                  <textarea
                    rows={8}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    readOnly={!isEditingDraft}
                    className={`w-full rounded-xl border border-border p-3 text-xs text-foreground font-sans leading-relaxed ${
                      isEditingDraft
                        ? 'bg-background ring-1 ring-primary'
                        : 'bg-muted/40'
                    }`}
                  />
                </div>

                {/* Footer Controls: Copy & Save */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    Neutral, professional tone without aggressive sales pitch.
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyColdEmail}
                      className="text-xs"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                          Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy Cold Email
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsColdOutreachOpen(false)
                        setStatusNotice(
                          `Cold pitch draft saved for ${selectedCompany?.company}.`
                        )
                      }}
                      className="text-xs"
                    >
                      Save &amp; Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
