import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const isAuthPage = req.nextUrl.pathname === '/login' ||
                     req.nextUrl.pathname === '/signup'

  // Check for any supabase auth cookie
  const cookies = req.cookies.getAll()
  const hasSession = cookies.some(c => c.name.includes('auth-token') || c.name.includes('supabase'))

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/problems',
    '/solve/:path*',
    '/leaderboard',
    '/profile',
    '/arena',
  ]
}