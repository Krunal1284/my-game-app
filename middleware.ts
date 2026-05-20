import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const isAuthPage = req.nextUrl.pathname === '/login' || 
                     req.nextUrl.pathname === '/signup'

  const token = req.cookies.get('sb-hmujcioxmrxfxamwkdih-auth-token')
  const hasSession = !!token

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard',
    '/problems',
    '/solve/:path*',
    '/leaderboard',
    '/profile',
    '/arena',
    '/login',
    '/signup',
  ],
}