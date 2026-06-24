'use client'

// =============================================================================
// MatchScore.tsx — score box with broadcast-style flip animation
//
// DECISION: AnimatePresence mode="popLayout" on the score number.
// When a goal is scored via WebSocket, the old score exits upward while the
// new score enters from below — the same convention used in scoreboard
// displays and broadcast overlays. The user immediately understands "score
// went up" from the direction of motion alone, before reading the number.
//
// mode="popLayout": the exiting element is removed from flow immediately so
// the entering element doesn't cause a layout shift. Without this, you'd see
// a brief flash where both the old and new score occupy space simultaneously.
//
// DECISION: key={score} on the motion.span.
// AnimatePresence detects children entering/leaving by their key. When score
// changes from 1 → 2, React unmounts the key="1" span and mounts key="2".
// AnimatePresence runs exit on "1" and initial→animate on "2" simultaneously.
//
// DECISION: The yellow "winning" highlight is a CSS class, not JS.
// The winning state (home > away or vice versa) is determined by the parent
// and passed as a prop. The score box doesn't compute this itself — that's
// the parent's concern. Clean single responsibility.
// =============================================================================

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MatchScoreProps {
  score:    number
  isWinning?: boolean
  size?:    'md' | 'lg'
}

export function MatchScore({ score, isWinning = false, size = 'md' }: MatchScoreProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'score-box flex items-center justify-center rounded-xl border-2 font-bold tabular-nums transition-colors duration-300',
        // Size variants — lg used in header/hero, md in cards
        size === 'md' && 'h-10 w-10 text-lg',
        size === 'lg' && 'h-14 w-14 text-3xl',
        // Winning highlight — yellow bg with no border
        isWinning
          ? 'border-transparent bg-brand text-brand-fg'
          : 'border-border bg-card text-foreground',
      )}
      aria-label={`Score: ${score}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={score}
          initial={!reduceMotion ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={!reduceMotion    ? { opacity: 0, y: 10  } : undefined}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {score}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
