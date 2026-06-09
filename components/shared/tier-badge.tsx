import { Tier, TIER_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

interface TierBadgeProps {
  tier: Tier
  showLabel?: boolean
  className?: string
}

export function TierBadge({ tier, showLabel = true, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier]
  if (tier === 'none') return null

  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold', config.color, className)}>
      {config.emoji}
      {showLabel && <span className="text-sm">{config.label}</span>}
    </span>
  )
}
