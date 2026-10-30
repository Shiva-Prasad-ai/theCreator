import React from 'react'

export function ModuleSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-72 rounded bg-muted/60" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-28 rounded-xl border border-border bg-card/60 p-4" />
        <div className="h-28 rounded-xl border border-border bg-card/60 p-4" />
        <div className="h-28 rounded-xl border border-border bg-card/60 p-4" />
      </div>

      <div className="h-80 w-full rounded-2xl border border-border bg-card/40" />
    </div>
  )
}
