'use client'

// =============================================================================
// ScoreBox.tsx — displays a team score with a flip animation on change
// Yellow background when this team is currently winning.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScoreBoxProps {
  score: number
  isWinning: boolean
  label: string // team name — for accessibility
}

export function ScoreBox({ score, isWinning, label }: ScoreBoxProps) {
  return (
    <div
      role="status"
      aria-label={`${label} score: ${score}`}
      className={cn(
        'score-box flex h-10 w-10 items-center justify-center rounded-lg border text-base font-bold transition-colors duration-300',
        isWinning
          ? 'border-brand bg-brand text-brand-fg' // winning — yellow
          : 'border-border bg-card text-foreground' // neutral
      )}
    >
      {/* AnimatePresence + key on score triggers exit→enter animation each time
          the score changes. The key change unmounts the old number (exit: slide up + fade)
          and mounts the new one (enter: slide up + fade in). */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={score}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="select-none tabular-nums"
        >
          {score}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
