'use client'

// =============================================================================
// ScoreCelebration.tsx — a quick sport-ball burst when the watched match scores
//
// Triggered from page.tsx on a SCORE INCREASE for the active match (not on
// chatter). The ball is chosen from the match's sport (⚽/🏀/🏏/🎾/🏉). The
// parent owns the lifecycle (sets `celebration` then clears it), so this is a
// pure presentational overlay. pointer-events-none so it never blocks clicks;
// disabled entirely under prefers-reduced-motion.
// =============================================================================

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SPORT_META } from '@/lib/constants'

interface ScoreCelebrationProps {
  celebration: { sport: string; id: number } | null
}

export function ScoreCelebration({ celebration }: ScoreCelebrationProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null

  const ball = celebration ? (SPORT_META[celebration.sport]?.icon ?? '🏆') : '🏆'

  return (
    <AnimatePresence mode="wait">
      {celebration && (
        <motion.div
          key={celebration.id}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="select-none text-[7rem] drop-shadow-2xl sm:text-[9rem]"
            initial={{ scale: 0.2, y: 60, rotate: -25, opacity: 0 }}
            animate={{
              scale: [0.2, 1.35, 1.1, 1],
              y: [60, -20, 0, 0],
              rotate: [-25, 12, -6, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.15, ease: 'easeOut', times: [0, 0.35, 0.6, 1] }}
          >
            {ball}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
