'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/avatar'
import { StarRating } from '@/components/shared/star-rating'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SERVICE_TYPES } from '@/types'
import { formatDate } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewSectionProps {
  reviews: any[]
  vouches: any[]
  profileId: string
  locale: string
  currentUserId?: string
  hasReviewed: boolean
  hasVouched: boolean
  isOwn: boolean
}

export function ReviewSection({
  reviews,
  vouches,
  profileId,
  locale,
  currentUserId,
  hasReviewed,
  hasVouched,
  isOwn,
}: ReviewSectionProps) {
  const t = useTranslations('profile')
  const router = useRouter()
  const supabase = createClient()

  const [reviewOpen, setReviewOpen] = useState(false)
  const [vouchOpen, setVouchOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [serviceType, setServiceType] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [vouchBody, setVouchBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submitReview() {
    if (!currentUserId) return
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      from_user_id: currentUserId,
      to_user_id: profileId,
      rating,
      service_type: serviceType || null,
      body: reviewBody || null,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Error: ' + error.message)
      return
    }
    toast.success(t('reviewSuccess'))
    setReviewOpen(false)
    router.refresh()
  }

  async function submitVouch() {
    if (!currentUserId) return
    if (!vouchBody.trim()) {
      toast.error('Vouch message is required.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('vouches').insert({
      from_user_id: currentUserId,
      to_user_id: profileId,
      body: vouchBody,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Error: ' + error.message)
      return
    }
    toast.success(t('vouchSuccess'))
    setVouchOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      {currentUserId && !isOwn && (
        <div className="flex gap-3">
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogTrigger asChild>
              <Button disabled={hasReviewed} title={hasReviewed ? t('alreadyReviewed') : undefined}>
                {t('leaveReview')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('reviewTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <StarRating value={rating} onChange={setRating} size="lg" />
                </div>
                <div>
                  <Label>{t('selectServiceType')}</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('reviewBody')}</Label>
                  <Textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                  />
                </div>
                <Button onClick={submitReview} disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={vouchOpen} onOpenChange={setVouchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={hasVouched} title={hasVouched ? t('alreadyVouched') : undefined}>
                {t('vouch')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('vouchTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t('vouchBody')}</Label>
                  <Textarea
                    value={vouchBody}
                    onChange={(e) => setVouchBody(e.target.value)}
                    placeholder="Why do you vouch for this servicer?"
                    rows={3}
                  />
                </div>
                <Button onClick={submitVouch} disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Give Vouch'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h3 className="font-semibold mb-3">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('noReviews')}</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {review.from_profile && (
                    <Avatar id={review.from_profile.id} name={review.from_profile.character_name} avatarUrl={review.from_profile.avatar_url} size="sm" />
                  )}
                  <span className="font-medium text-sm">{review.from_profile?.character_name ?? 'Anonymous'}</span>
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.service_type && (
                    <Badge variant="secondary" className="text-xs">{review.service_type}</Badge>
                  )}
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{formatDate(review.created_at, locale)}</span>
                </div>
                {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vouches */}
      <div>
        <h3 className="font-semibold mb-3">Vouches ({vouches.length})</h3>
        {vouches.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('noVouches')}</p>
        ) : (
          <div className="space-y-3">
            {vouches.map((vouch: any) => (
              <div key={vouch.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  {vouch.from_profile && (
                    <Avatar id={vouch.from_profile.id} name={vouch.from_profile.character_name} avatarUrl={vouch.from_profile.avatar_url} size="sm" />
                  )}
                  <span className="font-medium text-sm">{vouch.from_profile?.character_name ?? 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{formatDate(vouch.created_at, locale)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{vouch.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
