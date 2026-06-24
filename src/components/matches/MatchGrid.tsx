'use client'

// =============================================================================
// MatchGrid.tsx — section header, skeleton/error/empty states, grid, pagination
//
// DECISION: AnimatePresence key={page} on the grid container.
// When the user clicks Prev/Next, the entire grid fades out and the new page
// fades in. Without the key prop, AnimatePresence can't detect that the page
// changed (same component type, same position in the tree). The key forces
// React to unmount the old grid and mount the new one, triggering the
// crossfade animation.
//
// DECISION: grid-cols-1 on mobile, grid-cols-2 on lg+.
// The design shows 2 columns. On mobile a 2-column card layout makes team
// names unreadable (they'd be ~160px wide). One column at full width is
// always legible. The breakpoint is lg (1024px) not md (768px) because most
// tablet landscapes (iPad) have enough width for 2 columns.
//
// DECISION: MatchCardSkeleton component not inline pulsing divs.
// The old implementation used plain `<div className="animate-pulse h-44" />`
// which doesn't match the card layout — it's a generic rectangle. The
// MatchCardSkeleton maps to the exact same visual structure as MatchCard,
// so the transition from loading → loaded has zero layout shift.
//
// DECISION: The API counter badge is in the Header, not here.
// The design shows it next to "Current Matches" section heading. But it also
// appears in the Header in many sports apps (LiveScore, ESPN). We put it in
// the Header so it's visible even when the user scrolls down past the section
// heading. The section heading still shows the title for context.
// =============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { MatchCard }         from './MatchCard'
import { MatchCardSkeleton } from './MatchCardSkeleton'
import { Pagination }        from '@/components/ui/Pagination'
import { EmptyState }        from '@/components/ui/EmptyState'
import type { Match }        from '@/lib/types'

interface MatchGridProps {
  matches:       Match[]
  activeMatchId: number | null
  page:          number
  totalPages:    number
  isLoading:     boolean
  error:         string | null
  onWatch:       (id: number) => void
  onClose:       () => void
  onPrev:        () => void
  onNext:        () => void
}

export function MatchGrid({
  matches, activeMatchId, page, totalPages,
  isLoading, error, onWatch, onClose, onPrev, onNext,
}: MatchGridProps) {
  return (
    <section className="flex flex-1 flex-col gap-6 min-w-0" aria-label="Current Matches">

      {/* ── Section heading ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Accent bar — signals "this is a section" to the eye */}
        <div className="h-6 w-1 shrink-0 rounded-full bg-foreground" aria-hidden />
        <h2 className="text-xl font-bold tracking-tight">Current Matches</h2>
      </div>

      {/* ── Skeleton — matches exact card layout, no layout shift ─────── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-busy aria-label="Loading matches">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────────────── */}
      {!isLoading && error && (
        <div
          role="alert"
          className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-16 text-center dark:border-red-900/30 dark:bg-red-950/20"
        >
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Match grid — AnimatePresence crossfades on page change ─────── */}
      {!isLoading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            data-testid="match-grid"
          >
            {matches.length === 0 ? (
              <EmptyState />
            ) : (
              matches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isActive={match.id === activeMatchId}
                  index={index}
                  onWatch={onWatch}
                  onClose={onClose}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {!isLoading && !error && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </section>
  )
}
