import Link from 'next/link'
import { Avatar } from './avatar'
import { StarRating } from './star-rating'
import { TierBadge } from './tier-badge'
import { Badge } from '@/components/ui/badge'
import { ServicerWithProfile, SERVICE_TYPES } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ServicerCardProps {
  data: ServicerWithProfile
  locale: string
  availableLabel?: string
}

export function ServicerCard({ data, locale, availableLabel = 'Available' }: ServicerCardProps) {
  const { profile, servicer_profile, avg_rating, review_count, tier } = data

  const serviceLabels = (servicer_profile.service_types ?? [])
    .map((s) => SERVICE_TYPES.find((t) => t.value === s)?.label ?? s)
    .slice(0, 3)

  const priceStr =
    servicer_profile.price_min && servicer_profile.price_max
      ? `${formatCurrency(servicer_profile.price_min, servicer_profile.currency)} – ${formatCurrency(servicer_profile.price_max, servicer_profile.currency)}`
      : servicer_profile.price_min
      ? formatCurrency(servicer_profile.price_min, servicer_profile.currency)
      : null

  return (
    <Link href={`/${locale}/profile/${profile.id}`}>
      <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar id={profile.id} name={profile.character_name} avatarUrl={profile.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{profile.character_name}</h3>
              <TierBadge tier={tier} showLabel={false} />
              {servicer_profile.is_available && (
                <Badge variant="success" className="text-xs">{availableLabel}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile.server}</p>
            {profile.vocation && profile.vocation !== 'None' && (
              <p className="text-xs text-muted-foreground">{profile.vocation}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={Math.round(avg_rating)} readonly size="sm" />
          <span className="text-sm font-medium">{avg_rating > 0 ? avg_rating.toFixed(1) : '—'}</span>
          <span className="text-xs text-muted-foreground">({review_count})</span>
        </div>

        {serviceLabels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {serviceLabels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
            ))}
          </div>
        )}

        {priceStr && (
          <p className="text-sm font-medium text-primary">{priceStr}</p>
        )}
      </div>
    </Link>
  )
}
