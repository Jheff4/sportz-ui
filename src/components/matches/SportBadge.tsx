import { cn } from '@/lib/utils'
import type { Sport } from '@/lib/types'

interface SportBadgeProps {
  sport: Sport
  className?: string
}

export function SportBadge({ sport, className }: SportBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-foreground/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/70',
        className,
      )}
    >
      {sport}
    </span>
  )
}
