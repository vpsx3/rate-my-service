import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createMiddleware({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  // Run Supabase session update
  const supabaseResponse = await updateSession(request)

  // If Supabase redirected (e.g. to login), honour that
  if (supabaseResponse.status !== 200) return supabaseResponse

  return intlResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
