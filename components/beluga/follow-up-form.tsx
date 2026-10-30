'use client'

import React, { useState } from 'react'
import { Match, CallStatus } from '@/lib/beluga/types'
import { scheduleFollowUp, clearFollowUp } from '@/lib/beluga/actions'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  CalendarCheck,
} from 'lucide-react'

interface FollowUpFormProps {
  match: Match
  companyName: string
  productName: string
  onFollowUpUpdated: (updatedMatch: Match) => void
}

const CALL_STATUS_OPTIONS: { id: CallStatus; label: string; desc: string }[] = [
  { id: 'not_contacted', label: 'Not Contacted', desc: 'Identified candidate lead' },
  { id: 'scheduled', label: 'Follow-up Scheduled', desc: 'Call or reminder set' },
  { id: 'contacted', label: 'Outreach Sent', desc: 'Message or email dispatched' },
  { id: 'in_discussion', label: 'In Active Discussion', desc: 'Evaluating partnership' },
  { id: 'converted', label: 'Converted / Closed', desc: 'Contract or pilot signed' },
  { id: 'archived', label: 'Archived / Disqualified', desc: 'Not a fit at this time' },
]

export function FollowUpForm({
  match,
  companyName,
  productName,
  onFollowUpUpdated,
}: FollowUpFormProps) {
  // Format initial ISO date to datetime-local input format (YYYY-MM-DDTHH:mm)
  const formatForInput = (iso?: string | null) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    } catch {
      return ''
    }
  }

  const [dateValue, setDateValue] = useState<string>(formatForInput(match.follow_up_at))
  const [statusValue, setStatusValue] = useState<CallStatus>(
    (match.call_status as CallStatus) || 'not_contacted'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!dateValue) {
      setMessage({ type: 'error', text: 'Please pick a follow-up date and time.' })
      return
    }

    setIsSaving(true)
    try {
      const isoString = new Date(dateValue).toISOString()
      const res = await scheduleFollowUp(
        match.id,
        isoString,
        statusValue,
        companyName,
        productName
      )

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to schedule follow-up.' })
        return
      }

      setMessage({
        type: 'success',
        text: 'Follow-up saved and synchronized with your CreatorOS Calendar.',
      })

      onFollowUpUpdated({
        ...match,
        follow_up_at: isoString,
        call_status: statusValue,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    setIsClearing(true)
    setMessage(null)

    try {
      const res = await clearFollowUp(match.id)
      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to clear follow-up.' })
        return
      }

      setDateValue('')
      setStatusValue('not_contacted')
      setMessage({
        type: 'success',
        text: 'Follow-up cleared and removed from calendar events.',
      })

      onFollowUpUpdated({
        ...match,
        follow_up_at: null,
        call_status: 'not_contacted',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clear.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setIsClearing(false)
    }
  }

  const isOverdue =
    match.follow_up_at &&
    new Date(match.follow_up_at).getTime() < Date.now() &&
    statusValue !== 'converted' &&
    statusValue !== 'archived'

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Outreach & Follow-Up</h3>
            <p className="text-xs text-muted-foreground">
              Schedule meetings, set reminders, and synchronize with your calendar.
            </p>
          </div>
        </div>

        {match.follow_up_at && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              isOverdue
                ? 'border border-destructive/20 bg-destructive/10 text-destructive'
                : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <Clock className="h-3 w-3" />
            {isOverdue ? 'Overdue Reminder' : 'Active Reminder'}
          </span>
        )}
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
            message.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Date & Time Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Follow-Up Due Date & Time
          </label>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Outreach Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Current Outreach Status
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CALL_STATUS_OPTIONS.map((opt) => {
              const isSelected = statusValue === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusValue(opt.id)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <span className="font-semibold text-foreground text-xs">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {opt.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Calendar Sync Notice */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
          <span>
            Saving automatically registers a synchronized event in your{' '}
            <strong className="text-foreground">CreatorOS Editorial Calendar</strong>.
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          {match.follow_up_at ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving || isClearing}
              onClick={handleClear}
              className="text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              {isClearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1" />
              )}
              Clear Follow-up
            </Button>
          ) : (
            <div />
          )}

          <Button type="submit" size="sm" disabled={isSaving || isClearing}>
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Updating Calendar...
              </>
            ) : (
              'Save & Sync Calendar'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
