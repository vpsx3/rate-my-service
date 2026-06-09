'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/shared/avatar'
import { StarRating } from '@/components/shared/star-rating'
import { formatDate } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardClientProps {
  profile: any
  servicerProfile: any
  receivedReviews: any[]
  givenReviews: any[]
  receivedVouches: any[]
  givenVouches: any[]
  locale: string
}

export function DashboardClient({
  profile,
  servicerProfile,
  receivedReviews,
  givenReviews,
  receivedVouches,
  givenVouches,
  locale,
}: DashboardClientProps) {
  const t = useTranslations('dashboard')
  const supabase = createClient()
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState(servicerProfile?.is_available ?? false)

  async function toggleAvailable(value: boolean) {
    setIsAvailable(value)
    const { error } = await supabase
      .from('servicer_profiles')
      .update({ is_available: value })
      .eq('id', profile.id)
    if (error) {
      toast.error('Failed to update availability')
      setIsAvailable(!value)
    } else {
      toast.success(value ? 'Now available!' : 'Set as unavailable')
      router.refresh()
    }
  }

  async function markVerified(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .update({ verified: true })
      .eq('id', reviewId)
    if (error) {
      toast.error('Failed to mark as verified')
    } else {
      toast.success('Marked as verified!')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Status card */}
      {servicerProfile && (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <Switch
              checked={isAvailable}
              onCheckedChange={toggleAvailable}
              id="available-toggle"
            />
            <Label htmlFor="available-toggle" className="cursor-pointer">
              {t('availableToggle')}
            </Label>
          </div>
          <Badge variant={isAvailable ? 'success' : 'secondary'}>
            {isAvailable ? 'Online' : 'Offline'}
          </Badge>
          <Link href={`/${locale}/profile/${profile.id}`} className="ml-auto text-sm text-primary hover:underline">
            View profile →
          </Link>
        </div>
      )}

      <Tabs defaultValue="received-reviews">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="received-reviews" className="text-xs">
            {t('receivedReviews')} ({receivedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="given-reviews" className="text-xs">
            {t('givenReviews')} ({givenReviews.length})
          </TabsTrigger>
          <TabsTrigger value="received-vouches" className="text-xs">
            {t('receivedVouches')} ({receivedVouches.length})
          </TabsTrigger>
          <TabsTrigger value="given-vouches" className="text-xs">
            {t('givenVouches')} ({givenVouches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received-reviews">
          <ReviewList
            reviews={receivedReviews}
            profileKey="from_profile"
            locale={locale}
            onMarkVerified={markVerified}
            isOwner
          />
        </TabsContent>

        <TabsContent value="given-reviews">
          <ReviewList
            reviews={givenReviews}
            profileKey="to_profile"
            locale={locale}
          />
        </TabsContent>

        <TabsContent value="received-vouches">
          <VouchList vouches={receivedVouches} profileKey="from_profile" locale={locale} />
        </TabsContent>

        <TabsContent value="given-vouches">
          <VouchList vouches={givenVouches} profileKey="to_profile" locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReviewList({
  reviews,
  profileKey,
  locale,
  onMarkVerified,
  isOwner = false,
}: {
  reviews: any[]
  profileKey: string
  locale: string
  onMarkVerified?: (id: string) => void
  isOwner?: boolean
}) {
  const t = useTranslations('dashboard')

  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-sm py-6 text-center">{t('noReviews')}</p>
  }

  return (
    <div className="space-y-3 mt-3">
      {reviews.map((review) => {
        const p = review[profileKey]
        return (
          <div key={review.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {p && <Avatar id={p.id} name={p.character_name} avatarUrl={p.avatar_url} size="sm" />}
              <Link href={`/${locale}/profile/${p?.id}`} className="font-medium text-sm hover:underline">
                {p?.character_name ?? 'Unknown'}
              </Link>
              <StarRating value={review.rating} readonly size="sm" />
              {review.service_type && (
                <Badge variant="secondary" className="text-xs">{review.service_type}</Badge>
              )}
              {review.verified ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              ) : isOwner && onMarkVerified ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => onMarkVerified(review.id)}
                >
                  {t('markVerified')}
                </Button>
              ) : null}
              <span className="text-xs text-muted-foreground ml-auto">{formatDate(review.created_at, locale)}</span>
            </div>
            {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
          </div>
        )
      })}
    </div>
  )
}

function VouchList({ vouches, profileKey, locale }: { vouches: any[]; profileKey: string; locale: string }) {
  const t = useTranslations('dashboard')

  if (vouches.length === 0) {
    return <p className="text-muted-foreground text-sm py-6 text-center">{t('noVouches')}</p>
  }

  return (
    <div className="space-y-3 mt-3">
      {vouches.map((vouch: any) => {
        const p = vouch[profileKey]
        return (
          <div key={vouch.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              {p && <Avatar id={p.id} name={p.character_name} avatarUrl={p.avatar_url} size="sm" />}
              <Link href={`/${locale}/profile/${p?.id}`} className="font-medium text-sm hover:underline">
                {p?.character_name ?? 'Unknown'}
              </Link>
              <span className="text-xs text-muted-foreground ml-auto">{formatDate(vouch.created_at, locale)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{vouch.body}</p>
          </div>
        )
      })}
    </div>
  )
}
