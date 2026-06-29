'use client'

// =============================================================================
// LiveIndicator.tsx — animated red pulse dot + "Live" label
//
// DECISION: Framer Motion animate prop (not Tailwind `animate-ping`).
// Tailwind's animate-ping scales from 1 → 2 and fades — it's dramatic and
// was designed for notification badges. For a live broadcast indicator we want
// something more professional: a soft scale + opacity breathe. Framer Motion
// gives us exact control over the easing curve and amplitude.
//
// DECISION: The inner dot is static. Only the outer ring pulses.
// The inner dot is the "true" indicator — it's always solid red = live.
// The outer ring is the "pulse" — it communicates energy without distracting
// from the inner dot or the team names. Two layered elements, one meaning.
//
// DECISION: useReducedMotion stops the animation entirely for those who need it,
// but the red dot remains visible (the status doesn't disappear).
// =============================================================================

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  className?: string
  showLabel?: boolean
}

export function LiveIndicator({ className, showLabel = true }: LiveIndicatorProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Dot container */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {/* Outer pulsing ring */}
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full bg-red-400"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {/* Inner solid dot */}
        <span className="relative block h-2.5 w-2.5 rounded-full bg-live" />
      </span>

      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider text-live">Live</span>
      )}
    </div>
  )
}
