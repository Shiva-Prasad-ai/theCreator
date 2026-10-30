import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { CalendarEvent } from '@/lib/beluga/types'

export default async function CalendarPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let events: CalendarEvent[] = []

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('due_at', { ascending: true })

        if (data) {
          events = data as CalendarEvent[]
        }
      }
    } catch {
      // Dev mode fallback
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Editorial & Outreach Calendar
          </h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-xl">
          Unified schedule tracking creator milestones, publishing deadlines, and B2B follow-ups synchronized with the Beluga discovery radar.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <h4 className="font-semibold text-foreground text-sm">No Events Scheduled</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Schedule follow-ups on your Beluga candidate matches or set editorial deadlines.
            </p>
            <Link
              href="/dashboard/beluga"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Open Beluga Radar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          events.map((evt) => {
            const isOverdue =
              evt.due_at && new Date(evt.due_at).getTime() < Date.now() && evt.status !== 'converted'

            return (
              <div
                key={evt.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{evt.title}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {evt.type}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        isOverdue
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {evt.due_at ? new Date(evt.due_at).toLocaleString() : 'No date'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Status: <strong className="text-foreground">{evt.status || 'pending'}</strong>
                  </p>
                </div>

                {(evt.linked_type === 'beluga_match' || evt.linked_type === 'match') && (
                  <Link
                    href="/dashboard/beluga"
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    View in Beluga
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
