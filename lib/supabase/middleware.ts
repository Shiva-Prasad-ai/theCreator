import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase environment variables are not yet populated in .env.local,
  // pass through safely without crashing the Next.js runtime.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const pathname = url.pathname

    const isProtectedRoute =
      pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')
    const isAuthRoute = pathname === '/login' || pathname === '/signup'

    // Signed-out user trying to access protected routes -> redirect to /login
    if (!user && isProtectedRoute) {
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Already signed-in user visiting /login or /signup -> redirect to /dashboard
    if (user && isAuthRoute) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } catch {
    // If Supabase auth network call fails or client cannot be initialized, allow request through
    return supabaseResponse
  }

  return supabaseResponse
}
