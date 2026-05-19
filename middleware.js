import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    'https://hmujcioxmrxfxamwkdih.supabase.co',
    'sb_publishable_S3loM_5Zv0zz7Mq96R-jtA_URh36f_H',
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup'

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard', '/problems', '/solve/:path*', '/leaderboard', '/profile', '/arena', '/login', '/signup']
}