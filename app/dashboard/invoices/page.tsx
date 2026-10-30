import React from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isInvoicePersonaAllowed } from '@/lib/modules/invoices'
import { InvoicesClient } from './invoices-client'
import { PersonaRestricted } from './persona-restricted'

export default async function InvoicesPage() {
  const cookieStore = await cookies()
  const devPersona = cookieStore.get('dev_persona')?.value || 'content_creator'

  let currentPersona = devPersona

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('persona')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile?.persona) {
          currentPersona = profile.persona
        }
      }
    } catch {
      // Safe dev fallback
    }
  }

  // Enforce persona restriction: product_creator and freelancer personas only
  if (!isInvoicePersonaAllowed(currentPersona)) {
    return <PersonaRestricted currentPersona={currentPersona} />
  }

  return <InvoicesClient currentPersona={currentPersona} />
}
