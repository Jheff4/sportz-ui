import { cn } from '@/lib/utils'
import { EVENT_TYPE_COLORS } from '@/lib/constants'
import type { EventType } from '@/lib/types'

interface EventTypeBadgeProps {
  eventType: EventType
  className?: string
}

export function EventTypeBadge({ eventType, className }: EventTypeBadgeProps) {
  const colorClass = EVENT_TYPE_COLORS[eventType] ?? 'bg-muted text-foreground'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        colorClass,
        className,
      )}
    >
      {eventType.replace('_', ' ')}
    </span>
  )
}
