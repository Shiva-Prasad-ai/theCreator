import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  createInvoiceSchema,
  withComputedInvoice,
  isInvoicePersonaAllowed,
} from '@/lib/modules/invoices'

// Helper to check persona access for invoices
async function resolveUserAndPersona(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, persona: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('persona')
    .eq('user_id', user.id)
    .maybeSingle()

  const cookieStore = await cookies()
  const devPersona = cookieStore.get('dev_persona')?.value
  const persona = profile?.persona || devPersona || 'content_creator'

  return { user, persona }
}

// GET /app/api/invoices - List invoices for current user (RLS enforced)
export async function GET() {
  try {
    const supabase = await createClient()
    const { user, persona } = await resolveUserAndPersona(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isInvoicePersonaAllowed(persona)) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Invoices module is available to product_creator and freelancer personas only',
        },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const enriched = (data || []).map(withComputedInvoice)
    return NextResponse.json(enriched)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /app/api/invoices - Create invoice for current user (RLS enforced)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { user, persona } = await resolveUserAndPersona(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isInvoicePersonaAllowed(persona)) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Invoices module is available to product_creator and freelancer personas only',
        },
        { status: 403 }
      )
    }

    const rawBody = await request.json()
    const parsed = createInvoiceSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    // Insert only existing columns: user_id, client, items, tax, status, due_date, pdf_path
    // Total is NEVER stored in the database.
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client: parsed.data.client,
        items: parsed.data.items,
        tax: parsed.data.tax,
        status: parsed.data.status,
        due_date: parsed.data.due_date || null,
        pdf_path: parsed.data.pdf_path || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(withComputedInvoice(data), { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

