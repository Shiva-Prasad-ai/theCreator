import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getModulesForPersona } from '@/lib/modules/registry'
import {
  TrendingUp,
  Calendar,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  GraduationCap,
  Users,
  Compass,
  FileText,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const cookieStore = await cookies()
  const devPersona = cookieStore.get('dev_persona')?.value

  let persona = devPersona || 'content_creator'
  let displayName = 'Creator'
  let profileNiche = 'Tech & Media'

  // Metric counts (derived strictly from database)
  let earningsByCurrency: Record<string, number> = {}
  let totalEarningsCount = 0
  let eventsCount = 0
  let unreadNotifsCount = 0

  // Persona-specific database metrics
  let productsCount = 0
  let matchesCount = 0
  let templatesCount = 0
  let templateSales = 0
  let invoicesCount = 0
  let coursesCount = 0
  let courseSales = 0

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 1. Profile information
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile) {
          persona = devPersona || profile.persona || 'content_creator'
          displayName = profile.display_name || user.email?.split('@')[0] || 'Creator'
          profileNiche = profile.niche || 'Niche configured'
        }

        // 2. Global metrics for user: Earnings (strictly grouped by currency, never summed across currencies)
        const { data: earnRows } = await supabase
          .from('earnings')
          .select('amount, currency')
          .eq('user_id', user.id)
        if (earnRows) {
          totalEarningsCount = earnRows.length
          earnRows.forEach((row) => {
            const cur = (row.currency || 'USD').toUpperCase()
            earningsByCurrency[cur] = (earningsByCurrency[cur] || 0) + Number(row.amount || 0)
          })
        }

        // 3. Global metrics for user: Events
        const { count: evCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        eventsCount = evCount || 0

        // 4. Global metrics for user: Notifications
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)
        unreadNotifsCount = notifCount || 0

        // 5. Persona-specific queries
        if (persona === 'product_creator') {
          const { count: pCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          productsCount = pCount || 0

          const { count: mCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          matchesCount = mCount || 0
        } else if (persona === 'freelancer') {
          const { data: tRows } = await supabase
            .from('templates')
            .select('sales, price')
            .eq('user_id', user.id)
          if (tRows) {
            templatesCount = tRows.length
            templateSales = tRows.reduce((acc, row) => acc + (row.sales || 0), 0)
          }

          const { count: invCount } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          invoicesCount = invCount || 0
        } else if (persona === 'educator') {
          const { data: cRows } = await supabase
            .from('courses')
            .select('sales, price')
            .eq('user_id', user.id)
          if (cRows) {
            coursesCount = cRows.length
            courseSales = cRows.reduce((acc, row) => acc + (row.sales || 0), 0)
          }
        }
      }
    } catch {
      // Safe dev fallback
    }
  }

  const modules = getModulesForPersona(persona)

  // Empty state evaluation per persona
  const hasEarnings = Object.values(earningsByCurrency).some((amt) => amt > 0)
  let hasData = false
  if (persona === 'content_creator') {
    hasData = eventsCount > 0 || unreadNotifsCount > 0 || hasEarnings
  } else if (persona === 'product_creator') {
    hasData = productsCount > 0 || matchesCount > 0 || hasEarnings || eventsCount > 0
  } else if (persona === 'freelancer') {
    hasData = templatesCount > 0 || invoicesCount > 0 || hasEarnings || eventsCount > 0
  } else if (persona === 'educator') {
    hasData = coursesCount > 0 || hasEarnings || eventsCount > 0
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Workspace Active</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
            Welcome back, {displayName}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Your CreatorOS workspace is tailored for <strong className="text-foreground capitalize">{persona.replace('_', ' ')}</strong>. Monitor real-time metrics, deliverables, and audience channels.
          </p>
        </div>
      </div>

      {/* Empty State Banner (Shown when no activity exists in DB for this persona) */}
      {!hasData && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 sm:p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {persona === 'content_creator' && 'No Content Milestones or Activity Yet'}
            {persona === 'product_creator' && 'No Digital Products or Radar Leads Yet'}
            {persona === 'freelancer' && 'No Deliverable Templates or Invoices Yet'}
            {persona === 'educator' && 'No Published Courses or Student Enrollments Yet'}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {persona === 'content_creator' &&
              'Your workspace is connected and clean. Schedule your first publishing date in Calendar or check your notifications.'}
            {persona === 'product_creator' &&
              'Register your software or media products, then launch Beluga radar to find candidate partner companies in Bengaluru and India.'}
            {persona === 'freelancer' &&
              'Package reusable design kits or developer templates in the Template Tracker to start recording licensing sales.'}
            {persona === 'educator' &&
              'Build your video cohort or masterclass in the Course Tracker to enroll students and track tuition revenue.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {persona === 'content_creator' && (
              <Link href="/dashboard/calendar">
                <Button size="sm">Open Calendar</Button>
              </Link>
            )}
            {persona === 'product_creator' && (
              <>
                <Link href="/dashboard/products">
                  <Button size="sm">Add Product</Button>
                </Link>
                <Link href="/dashboard/beluga">
                  <Button size="sm" variant="outline">
                    Launch Beluga Radar
                  </Button>
                </Link>
              </>
            )}
            {persona === 'freelancer' && (
              <Link href="/dashboard/templates">
                <Button size="sm">Create First Template</Button>
              </Link>
            )}
            {persona === 'educator' && (
              <Link href="/dashboard/courses">
                <Button size="sm">Create First Course</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Persona-specific Metric Cards Grid (Real database counts, zero is fine) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Persona Overview */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Persona
            </span>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xl font-bold text-foreground capitalize">
            {persona.replace('_', ' ')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{profileNiche}</p>
        </div>

        {/* Card 2: Persona-Specific Primary Metric */}
        {persona === 'product_creator' ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Products Listed
              </span>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{productsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">{matchesCount} radar matches</p>
          </div>
        ) : persona === 'freelancer' ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Deliverable Templates
              </span>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{templatesCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">{templateSales} sales recorded</p>
          </div>
        ) : persona === 'educator' ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Courses Published
              </span>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{coursesCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">{courseSales} students enrolled</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Scheduled Events
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{eventsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Synchronized with calendar</p>
          </div>
        )}

        {/* Card 3: Real Database Earnings (Grouped by currency, never summed across currencies) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Earnings
            </span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {Object.keys(earningsByCurrency).length === 0 ? (
            <>
              <p className="mt-2 text-xl font-bold text-foreground">$0.00 USD</p>
              <p className="mt-1 text-xs text-muted-foreground">0 transactions recorded</p>
            </>
          ) : (
            <div className="mt-2 space-y-1">
              {Object.entries(earningsByCurrency).map(([cur, amount]) => (
                <p key={cur} className="text-xl font-bold text-foreground">
                  {cur === 'USD' ? '$' : cur === 'INR' ? '₹' : ''}
                  {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-semibold text-muted-foreground">{cur}</span>
                </p>
              ))}
              <p className="mt-1 text-xs text-muted-foreground">
                {totalEarningsCount} transaction{totalEarningsCount === 1 ? '' : 's'} recorded
              </p>
            </div>
          )}
        </div>

        {/* Card 4: Secondary Real Database Metric */}
        {persona === 'content_creator' ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notifications
              </span>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{unreadNotifsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {unreadNotifsCount === 0 ? 'All caught up' : 'Unread notifications'}
            </p>
          </div>
        ) : persona === 'product_creator' ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Outreach Follow-ups
              </span>
              <Compass className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{eventsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Beluga calendar events</p>
          </div>
        ) : persona === 'freelancer' ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Invoices
              </span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{invoicesCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Client billings tracked</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cohort Milestones
              </span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{eventsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Scheduled sessions</p>
          </div>
        )}
      </div>

      {/* Modules Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Workspace Modules
          </h3>
          <span className="text-xs text-muted-foreground">
            {modules.length} active modules
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules
            .filter((m) => m.id !== 'dashboard')
            .map((m) => {
              const Icon = m.icon
              return (
                <Link
                  key={m.id}
                  href={m.href}
                  className="group flex items-start justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {m.label}
                        {m.isComingSoon && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">
                            Soon
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.owner ? `Owned by ${m.owner}` : 'Core feature'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}
