import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/shared/header'
import { Avatar } from '@/components/shared/avatar'
import { StarRating } from '@/components/shared/star-rating'
import { Badge } from '@/components/ui/badge'
import { ReviewSection } from './review-section'
import { calculateTier, SERVICE_TYPES, TIER_CONFIG } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import { MapPin, Calendar } from 'lucide-react'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = await getTranslations('profile')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: servicerProfile } = await supabase
    .from('servicer_profiles')
    .select('*')
    .eq('id', id)
    .single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, from_profile:profiles!from_user_id(*)')
    .eq('to_user_id', id)
    .order('created_at', { ascending: false })

  const { data: vouches } = await supabase
    .from('vouches')
    .select('*, from_profile:profiles!from_user_id(*)')
    .eq('to_user_id', id)
    .order('created_at', { ascending: false })

  const allReviews = reviews ?? []
  const verifiedReviews = allReviews.filter((r) => r.verified)
  const avgRating = allReviews.length
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0

  const tier = calculateTier(verifiedReviews.length, avgRating)
  const tierConfig = TIER_CONFIG[tier]

  const hasReviewed = user ? allReviews.some((r) => r.from_user_id === user.id) : false
  const hasVouched = user ? (vouches ?? []).some((v: any) => v.from_user_id === user.id) : false
  const isOwn = user?.id === id

  const serviceLabels = (servicerProfile?.service_types ?? [])
    .map((s: string) => SERVICE_TYPES.find((t) => t.value === s)?.label ?? s)

  const priceStr = servicerProfile?.price_min != null && servicerProfile?.price_max != null
    ? `${formatCurrency(servicerProfile.price_min, servicerProfile.currency)} – ${formatCurrency(servicerProfile.price_max, servicerProfile.currency)}`
    : servicerProfile?.price_min != null
    ? formatCurrency(servicerProfile.price_min, servicerProfile.currency)
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8 p-6 border rounded-lg bg-card">
          <Avatar id={profile.id} name={profile.character_name} avatarUrl={profile.avatar_url} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{profile.character_name}</h1>
              {tier !== 'none' && (
                <span className={`text-xl font-bold ${tierConfig.color}`}>
                  {tierConfig.emoji} {tierConfig.label}
                </span>
              )}
              {servicerProfile?.is_available && (
                <Badge variant="success">Available now</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.server}</span>
              {profile.vocation && profile.vocation !== 'None' && (
                <span>{profile.vocation}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(profile.created_at, locale)}
              </span>
            </div>
            {allReviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({allReviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <section>
                <h2 className="text-lg font-semibold mb-2">{t('about')}</h2>
                <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-lg font-semibold mb-3">{t('about')} — Reviews</h2>
              <ReviewSection
                reviews={allReviews}
                vouches={vouches ?? []}
                profileId={id}
                locale={locale}
                currentUserId={user?.id}
                hasReviewed={hasReviewed}
                hasVouched={hasVouched}
                isOwn={isOwn}
              />
            </section>
          </div>

          <div className="space-y-4">
            {/* Service Info */}
            {servicerProfile && (
              <div className="p-4 border rounded-lg bg-card space-y-3">
                <h2 className="font-semibold">{t('serviceInfo')}</h2>

                {serviceLabels.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {serviceLabels.map((label: string) => (
                        <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {priceStr && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('priceRange')}</p>
                    <p className="font-semibold text-primary">{priceStr}</p>
                  </div>
                )}

                {servicerProfile.price_model && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Price model</p>
                    <p className="text-sm capitalize">{servicerProfile.price_model.replace('_', ' ')}</p>
                  </div>
                )}

                {servicerProfile.availability && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('availability')}</p>
                    <p className="text-sm">{servicerProfile.availability}</p>
                  </div>
                )}

                {servicerProfile.rules && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('rules')}</p>
                    <p className="text-sm whitespace-pre-line">{servicerProfile.rules}</p>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="p-4 border rounded-lg bg-card space-y-2">
              <h2 className="font-semibold">Stats</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold">{allReviews.length}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedReviews.length}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{(vouches ?? []).length}</p>
                  <p className="text-xs text-muted-foreground">Vouches</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
