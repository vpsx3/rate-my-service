import Image from 'next/image'
import { getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  id: string
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
}

export function Avatar({ id, name, avatarUrl, size = 'md', className }: AvatarProps) {
  const colorClass = getAvatarColor(id)
  const initial = name.charAt(0).toUpperCase()

  if (avatarUrl) {
    return (
      <div className={cn('relative rounded-full overflow-hidden', sizes[size], className)}>
        <Image src={avatarUrl} alt={name} fill className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
        colorClass,
        sizes[size],
        className
      )}
    >
      {initial}
    </div>
  )
}
