import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/rooms', '/login', '/register']
const ADMIN_ROUTES = ['/admin']
const PROTECTED_ROUTES = ['/account']
const PROTECTED_API_ROUTES = ['/api/v1/reservations', '/api/v1/notifications']

function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('accessToken')?.value
  if (cookieToken) return cookieToken

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files only
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = getTokenFromRequest(request)
  const isAuthenticated = !!token

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Redirect logged-in users away from login/register
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect frontend pages
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🔥 Protect API routes
  if (isProtectedApi && !isAuthenticated) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


/*import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/rooms', '/login', '/register']
const ADMIN_ROUTES = ['/admin']
const PROTECTED_ROUTES = ['/account'/*, '/book'*]
//-------------------------------------------------------
const PROTECTED_API_ROUTES = ['/api/v1/reservations', '/api/v1/notifications']

function getTokenFromRequest(request: NextRequest): string | null {
  // Try cookie first
  const cookieToken = request.cookies.get('accessToken')?.value
  if (cookieToken) return cookieToken
  
  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  
  return null
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.')
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    //pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = getTokenFromRequest(request)
  const isAuthenticated = !!token
  
  let userRole: string | null = null
  if (token) {
    const payload = parseJwtPayload(token)
    // The role is encoded in token authorities
    userRole = payload?.role as string ?? null
  }

  const isProtectedApi = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Require authentication for protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isProtectedApi && !isAuthenticated) {
  return NextResponse.json(
    { message: 'Unauthorized' },
    { status: 401 }
  )
}

  // Require admin role for admin routes
  if (isAdmin && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}*/
