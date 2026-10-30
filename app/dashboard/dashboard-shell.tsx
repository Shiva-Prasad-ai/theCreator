'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getModulesForPersona, PersonaType } from '@/lib/modules/registry'
import { signOut, updatePersona } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Loader2,
  Check,
} from 'lucide-react'

const PERSONA_OPTIONS: { id: PersonaType; label: string }[] = [
  { id: 'content_creator', label: 'Content Creator' },
  { id: 'product_creator', label: 'Product Creator' },
  { id: 'freelancer', label: 'Freelancer' },
  { id: 'educator', label: 'Educator' },
]

interface DashboardShellProps {
  children: React.ReactNode
  currentPersona: string
  displayName: string
  email: string
}

export function DashboardShell({
  children,
  currentPersona,
  displayName,
  email,
}: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [activePersona, setActivePersona] = useState(currentPersona)

  React.useEffect(() => {
    setActivePersona(currentPersona)
  }, [currentPersona])

  const modules = getModulesForPersona(activePersona)

  const handlePersonaChange = (newPersona: string) => {
    setActivePersona(newPersona)
    startTransition(async () => {
      try {
        await updatePersona(newPersona)
        router.refresh()
      } catch {
        // Safe dev fallback
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-foreground">CreatorOS AI</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Persona Badge */}
        <div className="border-b border-border px-6 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current Workspace
          </div>
          <div className="mt-0.5 text-xs font-medium text-foreground capitalize">
            {activePersona.replace('_', ' ')}
          </div>
        </div>

        {/* Module Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {modules.map((m) => {
            const Icon = m.icon
            const isActive = pathname === m.href

            return (
              <Link
                key={m.id}
                href={m.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{m.label}</span>
                </div>
                {m.isComingSoon && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Soon
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-foreground sm:text-lg">
              {modules.find((m) => m.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Top Bar Actions: Persona Switcher & User Menu */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
                <span className="text-muted-foreground hidden sm:inline">Persona:</span>
                <select
                  disabled={isPending}
                  value={activePersona}
                  onChange={(e) => handlePersonaChange(e.target.value)}
                  className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer capitalize"
                >
                  {PERSONA_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-popover text-popover-foreground">
                      {p.label}
                    </option>
                  ))}
                </select>
                {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-1" />}
              </div>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <span className="truncate max-w-[120px]">{displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-popover p-1 shadow-md text-popover-foreground">
                    <div className="border-b border-border px-3 py-2 text-xs">
                      <p className="font-semibold">{displayName}</p>
                      <p className="truncate text-muted-foreground text-[11px]">{email}</p>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] uppercase font-semibold text-muted-foreground">
                        Switch Persona
                      </div>
                      {PERSONA_OPTIONS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            handlePersonaChange(p.id)
                            setUserDropdownOpen(false)
                          }}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-muted rounded-md"
                        >
                          <span>{p.label}</span>
                          {activePersona === p.id && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-border pt-1">
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md font-medium"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
