import React from 'react'
import { LucideIcon, Clock, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  owner?: 'shiva' | 'bhavya' | 'tilak'
  isComingSoon?: boolean
  actionLabel?: string
  onAction?: () => void
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  owner,
  isComingSoon,
  actionLabel,
  onAction,
}: ModulePlaceholderProps) {
  return (
    <div className="flex min-h-[480px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-sm mb-4">
        <Icon className="h-7 w-7" />
      </div>

      <div className="max-w-md space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-card-foreground">
            {title}
          </h2>
          {isComingSoon && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="h-3 w-3" />
              Coming Soon
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {owner && isComingSoon && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Owned by <strong className="text-foreground capitalize">{owner}</strong> — Module slot reserved</span>
          </div>
        )}
      </div>

      {actionLabel && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
