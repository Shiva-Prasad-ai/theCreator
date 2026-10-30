import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gateway, GatewayError } from '@/lib/gateway'

// GET /app/api/courses/ad-copy - Check if the gateway is available for ad_copy
export async function GET() {
  try {
    const health = await gateway.getHealth()
    if (health.status === 'ok') {
      return NextResponse.json({ available: true, label: 'sample' })
    }
    return NextResponse.json({ available: false })
  } catch {
    // Gateway is offline or unavailable
    return NextResponse.json({ available: false })
  }
}

// POST /app/api/courses/ad-copy - Generate ad copy variants for course
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const token = session?.access_token || 'mock-dev-token'
    const body = await request.json()
    const { item, platform } = body

    if (!item) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'Missing course item name.' } },
        { status: 400 }
      )
    }

    // Call gateway task: ad_copy { item, platform }
    const res = await gateway.generate(token, {
      task: 'ad_copy',
      input: {
        item,
        platform: platform || 'Twitter/X',
      },
    })

    // Return the variants and response label/source
    const output = res.output as Record<string, unknown>
    let variants: string[] = []

    if (Array.isArray(output?.variants)) {
      variants = (output.variants as unknown[]).map((v) => {
        if (typeof v === 'string') return v
        if (v && typeof v === 'object') {
          const itemObj = v as Record<string, string>
          const parts: string[] = []
          if (itemObj.headline) parts.push(`📌 ${itemObj.headline}`)
          if (itemObj.body) parts.push(itemObj.body)
          if (itemObj.cta) parts.push(`👉 ${itemObj.cta}`)
          return parts.join('\n\n')
        }
        return JSON.stringify(v)
      })
    } else if (typeof output?.generated_content === 'string') {
      variants = [output.generated_content]
    } else if (typeof output?.result === 'string') {
      variants = [output.result]
    } else if (output) {
      variants = [JSON.stringify(output, null, 2)]
    }

    return NextResponse.json({
      success: true,
      label: res.label,
      source: res.source,
      variants,
      model: res.model,
    })
  } catch (err: unknown) {
    if (err instanceof GatewayError) {
      let status = 500
      if (err.code === 'unauthenticated') status = 401
      else if (err.code === 'bad_request') status = 400
      else if (err.code === 'not_found') status = 404
      else if (err.code === 'rate_limited') status = 429
      else if (err.code === 'llm_timeout') status = 504
      else if (err.code === 'invalid_output') status = 502

      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
          },
          available: false,
        },
        { status }
      )
    }

    const message = err instanceof Error ? err.message : 'AI gateway generation failed'
    return NextResponse.json(
      {
        error: {
          code: 'gateway_error',
          message,
        },
        available: false,
      },
      { status: 500 }
    )
  }
}
