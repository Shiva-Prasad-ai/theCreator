import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardShell } from './dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const cookieStore = await cookies()
  const devPersona = cookieStore.get('dev_persona')?.value || 'content_creator'

  // If Supabase credentials are not yet configured in .env.local, provide a graceful development shell
  if (!supabaseUrl || !supabaseKey) {
    return (
      <DashboardShell
        currentPersona={devPersona}
        displayName="Creator (Dev Mode)"
        email="dev@creatoros.ai"
      >
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400">
          <strong>Notice:</strong> <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are not configured in your <code>.env.local</code>. Running in local preview mode.
        </div>
        {children}
      </DashboardShell>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPersona = profile?.persona || devPersona || 'content_creator'
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Creator'
  const email = user.email || ''

  return (
    <DashboardShell
      currentPersona={currentPersona}
      displayName={displayName}
      email={email}
    >
      {children}
    </DashboardShell>
  )
}
