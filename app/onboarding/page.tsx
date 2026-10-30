'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { gateway } from '@/lib/gateway'
import { Button } from '@/components/ui/button'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react'

const PERSONAS = [
  {
    id: 'content_creator',
    label: 'Content Creator',
    description: 'Creators building audience through videos, newsletters, posts, and media.',
  },
  {
    id: 'product_creator',
    label: 'Product Creator',
    description: 'Founders and makers shipping SaaS, digital products, and physical goods.',
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    description: 'Independent consultants, designers, developers, and agency owners.',
  },
  {
    id: 'educator',
    label: 'Educator',
    description: 'Course creators, instructors, cohort leaders, and community mentors.',
  },
] as const

const AVAILABLE_PLATFORMS = [
  'YouTube',
  'Twitter/X',
  'Instagram',
  'TikTok',
  'LinkedIn',
  'Substack/Newsletter',
  'Discord',
  'GitHub',
  'Podcast',
]

const onboardingSchema = z.object({
  persona: z.enum([
    'content_creator',
    'product_creator',
    'freelancer',
    'educator',
  ]),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  niche: z.string().min(2, 'Please specify your niche or industry'),
  tone: z.string().min(2, 'Please define your brand or communication tone'),
  audience: z.string().min(2, 'Please describe your target audience'),
  goals: z.string().min(2, 'Please state your primary growth or business goals'),
  platforms: z.array(z.string()).min(1, 'Select at least one primary platform'),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [retryingMemory, setRetryingMemory] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [memoryWarning, setMemoryWarning] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)

  const [formData, setFormData] = useState<OnboardingFormData>({
    persona: 'content_creator',
    display_name: '',
    niche: '',
    tone: 'Professional & Direct',
    audience: '',
    goals: '',
    platforms: ['YouTube', 'Twitter/X'],
  })

  // Load existing session and profile if present
  useEffect(() => {
    async function loadUser() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // If Supabase credentials are not yet populated in .env.local, allow preview testing
      if (!supabaseUrl || !supabaseKey) {
        setCurrentUserId('dev-creator-id')
        setUserToken('mock-dev-token')
        setFormData((prev) => ({
          ...prev,
          display_name: prev.display_name || 'Alex River',
          niche: prev.niche || 'AI & Web Engineering',
          goals: prev.goals || 'Scale to 50k subscribers and launch new products',
          audience: prev.audience || 'Developers, tech creators, and entrepreneurs',
        }))
        setLoading(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login?next=/onboarding')
        return
      }

      setCurrentUserId(session.user.id)
      setUserToken(session.access_token)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (profile) {
        if (profile.onboarding_done) {
          router.push('/dashboard')
          return
        }
        setFormData({
          persona: profile.persona || 'content_creator',
          display_name:
            profile.display_name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            '',
          niche: profile.niche || '',
          tone: profile.tone || 'Professional & Direct',
          audience: profile.audience || '',
          goals: profile.goals || '',
          platforms: Array.isArray(profile.platforms) && profile.platforms.length > 0
            ? profile.platforms
            : ['YouTube', 'Twitter/X'],
        })
      } else {
        setFormData((prev) => ({
          ...prev,
          display_name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            '',
        }))
      }

      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  const validateStep = (currentStep: number): boolean => {
    setValidationErrors({})

    if (currentStep === 1) {
      const res = onboardingSchema.pick({ persona: true }).safeParse(formData)
      if (!res.success) {
        setValidationErrors({ persona: res.error.issues[0]?.message || 'Select a persona' })
        return false
      }
    } else if (currentStep === 2) {
      const res = onboardingSchema.pick({ display_name: true, niche: true }).safeParse(formData)
      if (!res.success) {
        const errors: Record<string, string> = {}
        res.error.issues.forEach((issue) => {
          if (issue.path[0]) errors[issue.path[0] as string] = issue.message
        })
        setValidationErrors(errors)
        return false
      }
    } else if (currentStep === 3) {
      const res = onboardingSchema.pick({ tone: true, audience: true }).safeParse(formData)
      if (!res.success) {
        const errors: Record<string, string> = {}
        res.error.issues.forEach((issue) => {
          if (issue.path[0]) errors[issue.path[0] as string] = issue.message
        })
        setValidationErrors(errors)
        return false
      }
    } else if (currentStep === 4) {
      const res = onboardingSchema.pick({ goals: true, platforms: true }).safeParse(formData)
      if (!res.success) {
        const errors: Record<string, string> = {}
        res.error.issues.forEach((issue) => {
          if (issue.path[0]) errors[issue.path[0] as string] = issue.message
        })
        setValidationErrors(errors)
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const togglePlatform = (p: string) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(p)
      if (exists) {
        return { ...prev, platforms: prev.platforms.filter((item) => item !== p) }
      }
      return { ...prev, platforms: [...prev.platforms, p] }
    })
  }

  const handleFinish = async () => {
    const parseResult = onboardingSchema.safeParse(formData)
    if (!parseResult.success) {
      setStep(1)
      return
    }

    if (!currentUserId) return

    setSubmitting(true)
    setMemoryWarning(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      try {
        await gateway.saveProfileMemory(
          'mock-dev-token',
          {
            persona: formData.persona,
            display_name: formData.display_name,
            niche: formData.niche,
            tone: formData.tone,
            audience: formData.audience,
            goals: formData.goals,
            platforms: formData.platforms,
            extras: {},
          },
          { useMock: true }
        )
      } catch {
        // Safe dev fallback
      }
      router.push('/dashboard')
      return
    }

    try {
      // 1. Upsert profile with onboarding_done = true
      const { error: upsertError } = await supabase.from('profiles').upsert({
        user_id: currentUserId,
        persona: formData.persona,
        display_name: formData.display_name,
        niche: formData.niche,
        tone: formData.tone,
        audience: formData.audience,
        goals: formData.goals,
        platforms: formData.platforms,
        onboarding_done: true,
      })

      if (upsertError) {
        throw new Error(upsertError.message)
      }

      // 2. Call POST /v1/memory/profile through /lib/gateway
      let profileHash: string | null = null
      try {
        const token = userToken || ''
        const memoryRes = await gateway.saveProfileMemory(token, {
          persona: formData.persona,
          display_name: formData.display_name,
          niche: formData.niche,
          tone: formData.tone,
          audience: formData.audience,
          goals: formData.goals,
          platforms: formData.platforms,
          extras: {},
        })

        if (memoryRes.ok && memoryRes.profile_hash) {
          profileHash = memoryRes.profile_hash
          // Update profile_hash in DB
          await supabase
            .from('profiles')
            .update({ profile_hash: profileHash })
            .eq('user_id', currentUserId)
        }
      } catch (err: unknown) {
        // 3. Gateway call failed: keep profile saved, show non-blocking notice with retry
        const msg = err instanceof Error ? err.message : 'Gateway request failed'
        setMemoryWarning(`Memory not saved yet (${msg}). Your profile is active. You can retry memory sync or continue.`)
        setSubmitting(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile'
      setValidationErrors({ general: msg })
      setSubmitting(false)
    }
  }

  const handleRetryMemory = async () => {
    if (!currentUserId || !userToken) return
    setRetryingMemory(true)
    try {
      const memoryRes = await gateway.saveProfileMemory(userToken, {
        persona: formData.persona,
        display_name: formData.display_name,
        niche: formData.niche,
        tone: formData.tone,
        audience: formData.audience,
        goals: formData.goals,
        platforms: formData.platforms,
        extras: {},
      })

      if (memoryRes.ok && memoryRes.profile_hash) {
        await supabase
          .from('profiles')
          .update({ profile_hash: memoryRes.profile_hash })
          .eq('user_id', currentUserId)

        setMemoryWarning(null)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gateway still unavailable'
      setMemoryWarning(`Memory sync retry failed (${msg}). You may proceed to your dashboard.`)
    } finally {
      setRetryingMemory(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'Select Persona'}
              {step === 2 && 'Identity & Niche'}
              {step === 3 && 'Tone & Audience'}
              {step === 4 && 'Goals & Platforms'}
              {step === 5 && 'Review & Finish'}
            </span>
          </div>
          <div className="flex h-1.5 w-full gap-1.5 overflow-hidden rounded-full bg-muted">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-full flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {validationErrors.general && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {validationErrors.general}
          </div>
        )}

        {memoryWarning && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">{memoryWarning}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryMemory}
                    disabled={retryingMemory}
                  >
                    {retryingMemory ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1.5" />
                        Retry Memory Sync
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => router.push('/dashboard')}
                  >
                    Continue to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Persona Dropdown */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground">
                Choose your Creator Persona
              </h2>
              <p className="text-sm text-muted-foreground">
                Your persona tailors your workspace modules, AI prompts, and automations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PERSONAS.map((p) => {
                const isSelected = formData.persona === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, persona: p.id })}
                    className={`flex flex-col items-start justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">
                        {p.label}
                      </span>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  </button>
                )
              })}
            </div>
            {validationErrors.persona && (
              <p className="text-xs text-destructive">{validationErrors.persona}</p>
            )}
          </div>
        )}

        {/* STEP 2: Display Name & Niche */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground">
                Identity & Niche
              </h2>
              <p className="text-sm text-muted-foreground">
                Define what you create and what you are known for.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g. Alex River"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {validationErrors.display_name && (
                  <p className="text-xs text-destructive">{validationErrors.display_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Niche / Domain
                </label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="e.g. AI Engineering & Web Development, Indie SaaS, Productivity"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {validationErrors.niche && (
                  <p className="text-xs text-destructive">{validationErrors.niche}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Tone & Target Audience */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground">
                Tone & Target Audience
              </h2>
              <p className="text-sm text-muted-foreground">
                How should your content sound, and who is it created for?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Brand / Voice Tone
                </label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder="e.g. Authentic, concise, analytical, educational, energetic"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {validationErrors.tone && (
                  <p className="text-xs text-destructive">{validationErrors.tone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Target Audience
                </label>
                <textarea
                  rows={3}
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g. Early-stage founders, frontend developers, and solopreneurs looking to scale"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {validationErrors.audience && (
                  <p className="text-xs text-destructive">{validationErrors.audience}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Goals & Platforms */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground">
                Primary Goal & Platforms
              </h2>
              <p className="text-sm text-muted-foreground">
                Select where you publish and what metric matters most.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Primary Goal (Next 90 Days)
                </label>
                <input
                  type="text"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="e.g. Reach 50k subscribers, launch new digital course, secure 5 brand sponsorships"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {validationErrors.goals && (
                  <p className="text-xs text-destructive">{validationErrors.goals}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Primary Platforms (Multi-select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_PLATFORMS.map((platform) => {
                    const active = formData.platforms.includes(platform)
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'border border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {platform}
                      </button>
                    )
                  })}
                </div>
                {validationErrors.platforms && (
                  <p className="text-xs text-destructive">{validationErrors.platforms}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Finish */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground">
                Review Your Creator Profile
              </h2>
              <p className="text-sm text-muted-foreground">
                Confirm your setup to initialize your tailored CreatorOS workspace.
              </p>
            </div>

            <div className="divide-y divide-border rounded-xl border border-border bg-muted/20 p-4 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Persona</span>
                <span className="font-semibold text-foreground capitalize">
                  {formData.persona.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Display Name</span>
                <span className="font-medium text-foreground">{formData.display_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Niche</span>
                <span className="font-medium text-foreground">{formData.niche}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Tone</span>
                <span className="font-medium text-foreground">{formData.tone}</span>
              </div>
              <div className="flex flex-col py-2">
                <span className="text-muted-foreground mb-1">Target Audience</span>
                <span className="font-medium text-foreground text-xs leading-relaxed">
                  {formData.audience}
                </span>
              </div>
              <div className="flex flex-col py-2">
                <span className="text-muted-foreground mb-1">Primary Goal</span>
                <span className="font-medium text-foreground text-xs leading-relaxed">
                  {formData.goals}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Platforms</span>
                <div className="flex flex-wrap gap-1">
                  {formData.platforms.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={submitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button type="button" size="sm" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              size="default"
              onClick={handleFinish}
              disabled={submitting}
              className="px-6 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving & Initializing AI Memory...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Finish & Launch Workspace
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
