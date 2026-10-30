'use client'

import React, { useState, useEffect } from 'react'
import { Product, Company, Match, PitchBrief } from '@/lib/beluga/types'
import { generatePitchBrief, saveBrief } from '@/lib/beluga/actions'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Edit3,
  Clock,
} from 'lucide-react'

interface PitchBriefEditorProps {
  product: Product
  company: Company
  match: Match
  onBriefUpdated: (updatedMatch: Match) => void
}

export function PitchBriefEditor({
  product,
  company,
  match,
  onBriefUpdated,
}: PitchBriefEditorProps) {
  const initialBrief = match.parsedBrief || {
    opening_line: '',
    talking_points: [''],
    objection: '',
    reply: '',
    is_manual: true,
  }

  const [brief, setBrief] = useState<PitchBrief>(initialBrief)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [gatewayWarnings, setGatewayWarnings] = useState<string[]>([])
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (match.parsedBrief) {
      setBrief(match.parsedBrief)
    } else {
      setBrief({
        opening_line: `Hi ${company.company} team, we built ${product.name} to help companies in ${company.industry || 'your space'} streamline creator workflows.`,
        talking_points: [
          `Engineered specifically for ${product.icp?.slice(0, 50) || 'modern teams'}.`,
          `Integrates directly into your existing production stack.`,
        ],
        objection: 'We currently handle this in-house or with manual spreadsheets.',
        reply: `${product.name} cuts execution time by over 40% while preserving strict quality control.`,
        is_manual: true,
      })
    }
  }, [match, company, product])

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setErrorMessage(null)
    setGatewayWarnings([])
    setSavedSuccess(false)

    try {
      const res = await generatePitchBrief(match.id, product, company)
      if (!res.success || !res.brief) {
        setErrorMessage(res.error || 'AI Gateway generation failed.')
        return
      }

      setBrief(res.brief)
      if (res.warnings && res.warnings.length > 0) {
        setGatewayWarnings(res.warnings)
      }
      setSavedSuccess(true)
      onBriefUpdated({
        ...match,
        brief: JSON.stringify(res.brief),
        parsedBrief: res.brief,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gateway request failed.'
      setErrorMessage(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveManual = async () => {
    setIsSaving(true)
    setErrorMessage(null)
    setSavedSuccess(false)

    try {
      const res = await saveBrief(match.id, {
        ...brief,
        is_manual: true,
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to save brief.')
        return
      }

      setSavedSuccess(true)
      onBriefUpdated({
        ...match,
        brief: JSON.stringify(brief),
        parsedBrief: brief,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save.'
      setErrorMessage(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const addTalkingPoint = () => {
    setBrief((prev) => ({
      ...prev,
      talking_points: [...prev.talking_points, ''],
      is_manual: true,
    }))
  }

  const updateTalkingPoint = (index: number, val: string) => {
    setBrief((prev) => {
      const copy = [...prev.talking_points]
      copy[index] = val
      return { ...prev, talking_points: copy, is_manual: true }
    })
  }

  const removeTalkingPoint = (index: number) => {
    setBrief((prev) => ({
      ...prev,
      talking_points: prev.talking_points.filter((_, i) => i !== index),
      is_manual: true,
    }))
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Pitch Brief: {company.company}
            </h3>
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
              {product.name}
            </span>
            {brief.is_manual && !brief.label ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                <Edit3 className="h-3 w-3" />
                manual
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  brief.label === 'sample' || brief.is_sample
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                {brief.label === 'sample' || brief.is_sample
                  ? 'Sample'
                  : brief.label === 'ai_suggested'
                  ? 'AI-suggested'
                  : 'AI-suggested'}
              </span>
            )}

            {brief.source === 'memory' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                served from memory
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-assisted talking points and objection responses tailored for this candidate lead.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateAI}
            disabled={isGenerating || isSaving}
            className="text-xs font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Generate AI Brief
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleSaveManual}
            disabled={isGenerating || isSaving}
            className="text-xs font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Brief
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="flex-1 leading-snug">{errorMessage}</p>
        </div>
      )}

      {gatewayWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          <p className="font-semibold">AI Gateway Notice:</p>
          <ul className="list-disc pl-4 mt-1 space-y-0.5">
            {gatewayWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Pitch brief successfully saved to match record.</span>
        </div>
      )}

      {/* Brief Fields Form */}
      <div className="space-y-4">
        {/* 1. Opening Line */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Opening Hook / Cold Outreach Line
            </label>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Edit3 className="h-3 w-3" /> Editable
            </span>
          </div>
          <textarea
            rows={2}
            value={brief.opening_line}
            onChange={(e) => setBrief({ ...brief, opening_line: e.target.value, is_manual: true })}
            placeholder="Introduce the value proposition and reference why this company was targeted..."
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed"
          />
        </div>

        {/* 2. Talking Points */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Key Value Pillars & Talking Points
            </label>
            <button
              type="button"
              onClick={addTalkingPoint}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Point
            </button>
          </div>

          <div className="space-y-2">
            {brief.talking_points.map((tp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={tp}
                  onChange={(e) => updateTalkingPoint(idx, e.target.value)}
                  placeholder={`Talking point #${idx + 1}`}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => removeTalkingPoint(idx)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Objection & 4. Prepared Reply */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Anticipated Objection
            </label>
            <textarea
              rows={3}
              value={brief.objection}
              onChange={(e) => setBrief({ ...brief, objection: e.target.value, is_manual: true })}
              placeholder="e.g. Budget constraints, existing tool in place, timing..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Counter Reply / Value Angle
            </label>
            <textarea
              rows={3}
              value={brief.reply}
              onChange={(e) => setBrief({ ...brief, reply: e.target.value, is_manual: true })}
              placeholder="How to address the objection directly and demonstrate quick ROI..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {brief.updated_at && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {new Date(brief.updated_at).toLocaleString()}
          </span>
          <span>{brief.is_manual ? 'Manual composition' : 'AI generated'}</span>
        </div>
      )}
    </div>
  )
}
