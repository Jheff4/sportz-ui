'use client'

// =============================================================================
// MatchGrid.tsx — section heading, 2-col grid, pagination
// Stagger animation: each card fades up 60ms after the previous one.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
import { MatchCard }  from './MatchCard'
import type { Match } from '@/lib/types'

// Framer Motion variants for the stagger container + individual cards
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,   // each child starts 60ms after previous
      delayChildren:   0.1,    // first child starts 100ms after parent mounts
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
}

interface MatchGridProps {
  matches:       Match[]
  activeMatchId: number | null
  totalCount:    number   // for the API counter badge
  page:          number
  totalPages:    number
  isLoading:     boolean
  error:         string | null
  onWatch:       (matchId: number) => void
  onClose:       () => void
  onPrev:        () => void
  onNext:        () => void
}

export function MatchGrid({
  matches,
  activeMatchId,
  totalCount,
  page,
  totalPages,
  isLoading,
  error,
  onWatch,
  onClose,
  onPrev,
  onNext,
}: MatchGridProps) {
  return (
    <section className="flex flex-1 flex-col gap-4" aria-label="Current Matches">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Left accent bar — matches the design */}
          <div className="h-6 w-1 rounded-full bg-foreground" />
          <h2 className="text-lg font-bold">Current Matches</h2>
        </div>
        {/* API counter badge */}
        <span
          className="rounded-md bg-foreground px-2.5 py-1 text-xs font-mono font-semibold text-background"
          aria-label={`${totalCount} matches available`}
        >
          API: {totalCount}
        </span>
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl bg-muted"
              aria-hidden
            />
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {error && !isLoading && (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Match grid ── */}
      {!isLoading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}  // re-triggers stagger animation on page change
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
            data-testid="match-grid"
          >
            {matches.map(match => (
              <motion.div key={match.id} variants={cardVariants}>
                <MatchCard
                  match={match}
                  isActive={match.id === activeMatchId}
                  onWatch={onWatch}
                  onClose={onClose}
                />
              </motion.div>
            ))}

            {matches.length === 0 && (
              <div className="col-span-2 flex items-center justify-center py-20 text-muted-foreground">
                No matches yet.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Pagination ── */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={page === 1}
              className="rounded-md border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              Prev
            </button>
            <button
              onClick={onNext}
              disabled={page === totalPages}
              className="rounded-md border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
