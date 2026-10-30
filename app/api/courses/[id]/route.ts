import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCourseSchema } from '@/lib/courses/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PATCH /app/api/courses/[id] - Update course or record sale
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json()
    const parsed = updateCourseSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const { increment_sales, add_to_earnings, ...updates } = parsed.data

    // 1. Fetch current course to verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      )
    }

    const finalUpdates: Record<string, unknown> = { ...updates }

    // 2. Handle updates
    if (typeof increment_sales === 'number' && increment_sales > 0) {
      const newSales = (existing.sales || 0) + increment_sales

      // Step A: Increment course sales
      const { data: updated, error: updateError } = await supabase
        .from('courses')
        .update({ ...updates, sales: newSales })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Step B: If requested, create manual earnings record
      if (add_to_earnings) {
        const saleAmount = Number(existing.price || 0) * increment_sales
        const today = new Date().toISOString().slice(0, 10)

        const { error: earnError } = await supabase.from('earnings').insert({
          user_id: user.id,
          amount: saleAmount,
          currency: 'USD',
          source: `Course Sale: ${existing.title}`,
          date: today,
          entry_type: 'manual',
        })

        if (earnError) {
          // Roll back sales increment immediately
          await supabase
            .from('courses')
            .update({ sales: existing.sales || 0 })
            .eq('id', id)
            .eq('user_id', user.id)

          return NextResponse.json(
            {
              error: `Earnings synchronization failed: ${earnError.message}. Sales increment was rolled back to previous value (${existing.sales || 0}).`,
              failure_window: 'Post-sales-increment earnings insertion failure. Rollback executed cleanly.',
            },
            { status: 500 }
          )
        }
      }

      return NextResponse.json(updated)
    }

    // Normal attribute updates (no sales increment)
    const { data: updated, error: updateError } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /app/api/courses/[id] - Delete course
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
