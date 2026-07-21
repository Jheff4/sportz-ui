'use client'

// =============================================================================
// StatusBadge.tsx — WebSocket connection status pill in the Header
//
// DECISION: Three distinct visual states, not just connected/disconnected.
// 'connecting' and 'reconnecting' are different user situations:
//   connecting    = first load, user expects this
//   reconnecting  = something broke, user is worried
// Distinguishing them with different copy ("Reconnecting...") and amber colour
// vs the static grey of "Connecting..." sets the right expectation.
//
// DECISION: CSS animation for the connected pulse, not Framer Motion.
// Reasoning in globals.css — pure compositor-thread animation, zero JS cost
// for the one thing that runs the entire session.
//
// DECISION: No animation for disconnected state.
// When disconnected, the last thing users want is a bouncing red badge.
// Static red = calm urgency. It matches the severity without adding panic.
// =============================================================================

import { cn } from '@/lib/utils'
import type { WsStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: WsStatus
}

const config: Record<
  WsStatus,
  { dot: string; pulse: string; label: string; shortLabel: string; badge: string }
> = {
  connected: {
    dot: 'bg-connected',
    pulse: 'ws-pulse-connected',
    label: 'Live Connected',
    shortLabel: 'Live',
    badge:
      'border-connected/30 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400',
  },
  connecting: {
    dot: 'bg-muted-foreground',
    pulse: '',
    label: 'Connecting',
    shortLabel: 'Connecting',
    badge: 'border-border text-muted-foreground bg-muted',
  },
  reconnecting: {
    dot: 'bg-amber-500',
    pulse: 'ws-pulse-reconnecting',
    label: 'Reconnecting…',
    shortLabel: 'Reconnecting',
    badge:
      'border-amber-300/50 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
  },
  disconnected: {
    dot: 'bg-live',
    pulse: '',
    label: 'Disconnected',
    shortLabel: 'Offline',
    badge: 'border-red-300/50 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { dot, pulse, label, shortLabel, badge } = config[status]

  return (
    <div
      role="status"
      aria-label={`WebSocket status: ${label}`}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold',
        badge
      )}
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dot, pulse)} />
      {/* Full label on sm+; a shorter one on mobile so the badge never wraps and crowds the header. */}
      <span className="uppercase tracking-wide sm:hidden">{shortLabel}</span>
      <span className="hidden uppercase tracking-wide sm:inline">{label}</span>
    </div>
  )
}
