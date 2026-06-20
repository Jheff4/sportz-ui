'use client'

// =============================================================================
// MatchCard.tsx — three visual states
//   default   → white card, "Watch Live" yellow button
//   active    → yellow border, "Watching Live" (teal) + "Close" buttons
// Framer Motion: spring border + shadow on selection, stagger handled by parent
// =============================================================================

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SportBadge } from './SportBadge'
import { LiveBadge }  from './LiveBadge'
import { ScoreBox }   from './ScoreBox'
import type { Match } from '@/lib/types'

interface MatchCardProps {
  match:     Match
  isActive:  boolean
  onWatch:   (matchId: number) => void
  onClose:   () => void
}

export function MatchCard({ match, isActive, onWatch, onClose }: MatchCardProps) {
  const { id, sport, homeTeam, awayTeam, homeScore, awayScore, status, startTime } = match

  const homeWinning = homeScore > awayScore
  const awayWinning = awayScore > homeScore
  const isLive      = status === 'live'

  const time = new Date(startTime).toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      layout
      // Spring-based transition makes the border/shadow feel physical, not robotic
      animate={{
        boxShadow: isActive
          ? '0 0 0 2px #f5c518, 0 8px 24px rgba(245,197,24,0.18)'
          : '0 0 0 1px oklch(0.90 0 0 / 1), 0 1px 3px rgba(0,0,0,0.06)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex flex-col gap-4 rounded-xl bg-card p-4 text-card-foreground dark:shadow-none',
        isActive && 'ring-2 ring-brand',
      )}
      data-testid={`match-card-${id}`}
    >
      {/* ── Header row: sport badge + live indicator ── */}
      <div className="flex items-center justify-between">
        <SportBadge sport={sport} />
        {isLive && <LiveBadge />}
      </div>

      {/* ── Teams + scores ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">{homeTeam}</span>
          <ScoreBox score={homeScore} isWinning={homeWinning} label={homeTeam} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">{awayTeam}</span>
          <ScoreBox score={awayScore} isWinning={awayWinning} label={awayTeam} />
        </div>
      </div>

      {/* ── Footer: time + action buttons ── */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">{time}</span>

        {isActive ? (
          <div className="flex items-center gap-2">
            {/* Watching Live — teal/blue */}
            <button
              onClick={() => onWatch(id)}
              className="rounded-full bg-watching px-4 py-1.5 text-sm font-semibold text-watching-fg transition-opacity hover:opacity-90"
              aria-label={`Watching ${homeTeam} vs ${awayTeam}`}
            >
              Watching Live
            </button>
            {/* Close — outlined */}
            <button
              onClick={onClose}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              aria-label="Close commentary"
            >
              Close
            </button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{  scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => onWatch(id)}
            className="rounded-full bg-brand px-5 py-1.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
            aria-label={`Watch ${homeTeam} vs ${awayTeam} live`}
          >
            Watch Live
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
