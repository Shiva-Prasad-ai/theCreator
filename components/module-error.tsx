'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModuleErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  moduleName?: string
}

export function ModuleError({ error, reset, moduleName }: ModuleErrorProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-lg font-bold text-destructive">
          Error loading {moduleName || 'module'}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error.message || 'An unexpected error occurred while loading this view.'}
        </p>
      </div>

      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
