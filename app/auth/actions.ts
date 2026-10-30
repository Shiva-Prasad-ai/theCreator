'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {
      // Safe dev fallback
    }
  }

  const cookieStore = await cookies()
  cookieStore.delete('dev_persona')

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updatePersona(newPersona: string) {
  const cookieStore = await cookies()
  // Save selected persona in cookie so preview mode and testing persist across navigations
  cookieStore.set('dev_persona', newPersona, { path: '/' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    revalidatePath('/dashboard', 'layout')
    return { success: true, mode: 'preview' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ persona: newPersona })
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database update failed'
    return { success: false, error: message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
