import React from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  getProducts,
  getCompanies,
} from '@/lib/beluga/actions'
import { BengaluruRadarView } from '@/components/beluga/bengaluru-radar-view'
import { Product } from '@/lib/beluga/types'

export default async function BelugaPage() {
  const cookieStore = await cookies()
  const devPersona = cookieStore.get('dev_persona')?.value || 'product_creator'

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

  // Load Beluga Data
  const [dbProducts, companies] = await Promise.all([
    getProducts(),
    getCompanies(),
  ])

  const products: Product[] =
    dbProducts.length > 0
      ? dbProducts
      : [
          {
            id: 'prod-default-1',
            user_id: 'active-creator',
            name: 'CreatorOS AI Suite',
            industry: 'AI & Creator Tools',
            icp: 'Digital media startups, creator agencies, and enterprise SaaS buyers looking for AI automation.',
            description: 'Next-generation AI workflow and revenue discovery platform for creators and digital studios.',
            created_at: new Date().toISOString(),
          },
        ]

  return (
    <BengaluruRadarView
      product={products[0]}
      initialCompanies={companies}
      currentPersona={currentPersona}
    />
  )
}
