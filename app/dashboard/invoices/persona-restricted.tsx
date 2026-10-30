'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowRight, Loader2, Sparkles, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updatePersona } from '@/app/auth/actions'

interface PersonaRestrictedProps {
  currentPersona: string
}

export function PersonaRestricted({ currentPersona }: PersonaRestrictedProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSwitchPersona = (newPersona: string) => {
    startTransition(async () => {
      await updatePersona(newPersona)
      router.refresh()
    })
  }

  const formatPersonaName = (p: string) => {
    return p
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  return (
    <div className="flex min-h-[500px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-5">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Access Restricted</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Persona Access Required
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The <strong className="text-foreground">Invoices & Billing</strong> module is available
          exclusively to the <strong className="text-foreground">Product Creator</strong> and{' '}
          <strong className="text-foreground">Freelancer</strong> personas.
        </p>

        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Current workspace persona:{' '}
          <span className="font-semibold text-foreground capitalize">
            {formatPersonaName(currentPersona)}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            size="sm"
            onClick={() => handleSwitchPersona('product_creator')}
            disabled={isPending}
            className="gap-1.5 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            Switch to Product Creator
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSwitchPersona('freelancer')}
            disabled={isPending}
            className="gap-1.5 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            Switch to Freelancer
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

