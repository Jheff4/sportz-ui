'use client'

// =============================================================================
// CommentaryPanel.tsx — right-hand live commentary pane
// Light blue in light mode, deep navy in dark mode (see globals.css --commentary-*)
// =============================================================================

import { AnimatePresence } from 'framer-motion'
import { CommentaryEvent } from './CommentaryEvent'
import type { Commentary } from '@/lib/types'

interface CommentaryPanelProps {
  commentary: Commentary[]
  isLoading:  boolean
  matchId:    number | null
}

export function CommentaryPanel({ commentary, isLoading, matchId }: CommentaryPanelProps) {
  return (
    <aside
      className="flex w-80 shrink-0 flex-col rounded-2xl bg-commentary p-4 lg:w-96"
      aria-label="Live Commentary"
      data-testid="commentary-panel"
    >
      {/* ── Panel header ── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-commentary-fg">Live Commentary</h2>
        <span className="rounded-full border border-commentary-fg/30 px-3 py-0.5 text-[11px] font-semibold text-commentary-fg/80">
          Real-time
        </span>
      </div>

      {/* ── No match selected ── */}
      {matchId === null && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-commentary-fg/50">
          <span className="text-2xl">🏟️</span>
          <p className="text-sm">Click <strong>Watch Live</strong> on any match to follow commentary here.</p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-commentary-fg/20" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-commentary-fg/15" />
                <div className="h-10 animate-pulse rounded-lg bg-commentary-fg/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Commentary feed ── */}
      {!isLoading && matchId !== null && (
        <div
          className="commentary-scroll flex flex-1 flex-col overflow-y-auto pr-1"
          aria-live="polite"
          aria-label="Commentary events"
        >
          <AnimatePresence initial={false}>
            {commentary.map(event => (
              <CommentaryEvent key={event.id} event={event} />
            ))}
          </AnimatePresence>

          {commentary.length === 0 && (
            <p className="text-center text-sm text-commentary-fg/50">
              No commentary yet for this match.
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
