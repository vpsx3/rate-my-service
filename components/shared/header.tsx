'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Swords } from 'lucide-react'

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const otherLocale = locale === 'pt' ? 'en' : 'pt'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg text-primary">
          <Swords className="h-6 w-6" />
          <span>Rate My Service</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href={`/${locale}/explore`} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
            {t('explore')}
          </Link>

          {user ? (
            <>
              <Link href={`/${locale}/dashboard`} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
                {t('dashboard')}
              </Link>
              <Link href={`/${locale}/settings`} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
                {t('settings')}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </>
          ) : (
            <Link href={`/${locale}/login`}>
              <Button size="sm">{t('login')}</Button>
            </Link>
          )}

          <Link
            href={`/${otherLocale}${typeof window !== 'undefined' ? window.location.pathname.replace(/^\/(pt|en)/, '') : ''}`}
            className="text-xs font-medium text-muted-foreground hover:text-foreground border rounded px-2 py-1"
          >
            {t('switchLocale')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
