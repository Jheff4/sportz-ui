// =============================================================================
// SportBadge.tsx — sport category pill (FOOTBALL, CRICKET, BASKETBALL…)
//
// DECISION: Server component — no 'use client'.
// SportBadge has no state, no events, no effects. Rendering on the server
// means it contributes zero to the client JS bundle. With 6–12 cards per
// page, this matters.
// =============================================================================

import { cn } from '@/lib/utils'
import type { Sport } from '@/lib/types'

interface SportBadgeProps {
  sport:      Sport
  className?: string
}

export function SportBadge({ sport, className }: SportBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-foreground/15',
        'px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        'text-foreground/60 bg-muted/50',
        className,
      )}
    >
      {sport}
    </span>
  )
}
