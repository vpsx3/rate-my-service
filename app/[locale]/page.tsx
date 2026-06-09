import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/header'
import { ServicerCard } from '@/components/shared/servicer-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { calculateTier, ServicerWithProfile } from '@/types'
import Link from 'next/link'
import { Search, Shield, Star, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

async function getTopServicers(_locale: string): Promise<ServicerWithProfile[]> {
  const supabase = await createClient()

  const { data: servicers } = await supabase
    .from('servicer_profiles')
    .select('*, profiles(*)')
    .eq('is_available', true)
    .limit(6)

  if (!servicers) return []

  const results: ServicerWithProfile[] = []

  for (const s of servicers) {
    const profile = (s as any).profiles
    if (!profile) continue

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, verified')
      .eq('to_user_id', profile.id)

    const allReviews = reviews ?? []
    const verifiedReviews = allReviews.filter((r) => r.verified)
    const avgRating = allReviews.length
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
      : 0

    results.push({
      profile,
      servicer_profile: s,
      avg_rating: Math.round(avgRating * 10) / 10,
      review_count: allReviews.length,
      verified_review_count: verifiedReviews.length,
      tier: calculateTier(verifiedReviews.length, avgRating),
    })
  }

  return results.sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 6)
}

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const { q } = await searchParams
  const t = await getTranslations('landing')
  const tc = await getTranslations('common')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (q) {
    redirect(`/${locale}/explore?q=${encodeURIComponent(q)}`)
  }

  const topServicers = await getTopServicers(locale)

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t('headline')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('subheadline')}
            </p>
            <form action={`/${locale}`} method="GET" className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder={t('searchPlaceholder')}
                  className="pl-9"
                />
              </div>
              <Button type="submit">{t('searchButton')}</Button>
            </form>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Ratings & Reviews</h3>
              <p className="text-sm text-muted-foreground">Community-verified ratings for every servicer.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Vouches</h3>
              <p className="text-sm text-muted-foreground">Personal endorsements from players you trust.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Tier System</h3>
              <p className="text-sm text-muted-foreground">Bronze to Diamond — earn your reputation.</p>
            </div>
          </div>
        </section>

        {/* Top Servicers */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t('topServicers')}</h2>
              <Link href={`/${locale}/explore`}>
                <Button variant="outline">{t('viewAll')}</Button>
              </Link>
            </div>
            {topServicers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topServicers.map((s) => (
                  <ServicerCard
                    key={s.profile.id}
                    data={s}
                    locale={locale}
                    availableLabel={tc('available')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No servicers yet. Be the first!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="py-16 px-4 bg-primary text-primary-foreground">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold mb-3">{t('ctaTitle')}</h2>
              <p className="mb-6 opacity-90">{t('ctaDesc')}</p>
              <Link href={`/${locale}/login`}>
                <Button variant="secondary" size="lg">{t('ctaButton')}</Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Rate My Service. Built for the Tibia community.</p>
      </footer>
    </div>
  )
}
