// =============================================================================
// SportBadge.tsx — sport category pill (⚽ FOOTBALL, 🏀 BASKETBALL…)
//
// DECISION: Server component — no 'use client'.
// SportBadge has no state, no events, no effects. Rendering on the server
// means it contributes zero to the client JS bundle. With 6–12 cards per
// page, this matters.
//
// DECISION: per-sport icon + accent color (SPORT_META), not one grey pill.
// A glance now tells you the sport, and different sports don't blur together
// in the grid. Falls back to a neutral pill for any unknown sport string.
// =============================================================================

import { cn } from '@/lib/utils'
import { SPORT_META } from '@/lib/constants'
import type { Sport } from '@/lib/types'

interface SportBadgeProps {
  sport: Sport
  className?: string
}

const FALLBACK = {
  icon: '🏟️',
  badge: 'border-foreground/15 text-foreground/60 bg-muted/50',
}

export function SportBadge({ sport, className }: SportBadgeProps) {
  const { icon, badge } = SPORT_META[sport] ?? FALLBACK

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border',
        'px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        badge,
        className
      )}
    >
      <span aria-hidden className="text-[11px] leading-none">
        {icon}
      </span>
      {sport}
    </span>
  )
}
