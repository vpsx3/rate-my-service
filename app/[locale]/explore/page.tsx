import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/header'
import { ServicerCard } from '@/components/shared/servicer-card'
import { ExploreFilters } from './explore-filters'
import { calculateTier, ServicerWithProfile, PriceModel } from '@/types'
import { getTranslations } from 'next-intl/server'

const PAGE_SIZE = 20

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    server?: string
    vocation?: string
    service_type?: string
    price_model?: string
    available?: string
    min_rating?: string
    page?: string
  }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('explore')
  const tc = await getTranslations('common')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const page = parseInt(sp.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('servicer_profiles')
    .select('*, profiles!inner(*)', { count: 'exact' })

  if (sp.available === 'true') {
    query = query.eq('is_available', true)
  }
  if (sp.price_model) {
    query = query.eq('price_model', sp.price_model as PriceModel)
  }
  if (sp.service_type) {
    query = query.contains('service_types', [sp.service_type])
  }
  if (sp.server) {
    query = query.eq('profiles.server', sp.server)
  }
  if (sp.vocation) {
    query = query.eq('profiles.vocation', sp.vocation)
  }
  if (sp.q) {
    query = query.ilike('profiles.character_name', `%${sp.q}%`)
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: servicers, count } = await query

  const results: ServicerWithProfile[] = []

  for (const s of servicers ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const minRating = sp.min_rating ? parseFloat(sp.min_rating) : 0
    if (avgRating < minRating) continue

    results.push({
      profile,
      servicer_profile: s,
      avg_rating: Math.round(avgRating * 10) / 10,
      review_count: allReviews.length,
      verified_review_count: verifiedReviews.length,
      tier: calculateTier(verifiedReviews.length, avgRating),
    })
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <ExploreFilters currentParams={sp} locale={locale} />
          </aside>
          <div className="flex-1">
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">{tc('noResults')}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((s) => (
                    <ServicerCard
                      key={s.profile.id}
                      data={s}
                      locale={locale}
                      availableLabel={tc('available')}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    {page > 1 && (
                      <a
                        href={`/${locale}/explore?${new URLSearchParams({ ...sp, page: String(page - 1) })}`}
                        className="px-4 py-2 border rounded hover:bg-accent text-sm"
                      >
                        {t('previous')}
                      </a>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {t('page')} {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                      <a
                        href={`/${locale}/explore?${new URLSearchParams({ ...sp, page: String(page + 1) })}`}
                        className="px-4 py-2 border rounded hover:bg-accent text-sm"
                      >
                        {t('next')}
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
