import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  updateInvoiceSchema,
  withComputedInvoice,
  isInvoicePersonaAllowed,
} from '@/lib/modules/invoices'

interface RouteContext {
  params: Promise<{ id: string }>
}

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

// GET /app/api/invoices/[id] - Get a single invoice for current user
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(withComputedInvoice(data))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /app/api/invoices/[id] - Update invoice for current user (RLS enforced)
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
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
    const parsed = updateInvoiceSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    // Verify ownership and existence
    const { data: existing, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      )
    }

    // Build update object only with provided columns (no new columns or total stored)
    const updates: Record<string, unknown> = {}
    if (parsed.data.client !== undefined) updates.client = parsed.data.client
    if (parsed.data.items !== undefined) updates.items = parsed.data.items
    if (parsed.data.tax !== undefined) updates.tax = parsed.data.tax
    if (parsed.data.status !== undefined) updates.status = parsed.data.status
    if (parsed.data.due_date !== undefined) updates.due_date = parsed.data.due_date || null
    if (parsed.data.pdf_path !== undefined) updates.pdf_path = parsed.data.pdf_path || null

    const { data: updated, error: updateError } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(withComputedInvoice(updated))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /app/api/invoices/[id] - Delete invoice for current user (RLS enforced)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
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

    const { data: existing, error: fetchError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

