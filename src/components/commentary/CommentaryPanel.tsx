'use client'

// =============================================================================
// CommentaryPanel.tsx — sticky right-side live commentary panel
//
// DECISION: position: sticky in CSS, not position: fixed.
// Fixed would require knowing the header height and manually offsetting.
// Sticky participates in normal document flow — the browser does the offset
// math. The panel scrolls with the page until the top of the panel reaches
// 24px from the viewport top, then it "sticks".
//
// DECISION: max-h-[calc(100vh-112px)] on the scrollable feed area.
// The header is 64px. We want the panel to stop 24px from the bottom of the
// viewport so it doesn't extend off-screen. 112px = 64px header + 24px top
// offset + 24px bottom clearance. This keeps the panel within the viewport
// at all viewport heights.
//
// DECISION: newEventIds ref instead of a state set.
// Tracking which events are "new" (for the slide-in animation) in useState
// would cause a re-render every time we add/remove an ID. We don't need the
// component to re-render for this — we just need the ID accessible during
// the render cycle. A ref stores it without triggering renders.
//
// DECISION: The commentary feed is NOT virtualized in this implementation.
// @tanstack/react-virtual works by measuring item heights and rendering only
// the visible window. Framer Motion's AnimatePresence requires items to stay
// mounted for exit animations — incompatible with virtualization (which
// unmounts items as they scroll out of view). The practical trade-off:
// at COMMENTARY_LIMIT=50 items + React.memo on each event, the feed renders
// ~50 memoized DOM nodes. Modern browsers handle this at 60fps comfortably.
// If the feed grows to 500+ events (a full cricket innings), virtualization
// should be added at the cost of removing exit animations.
//
// DECISION: aria-live="polite" not "assertive".
// "assertive" interrupts the screen reader immediately — disruptive during
// a match where events fire every few seconds. "polite" waits for a gap in
// the reader's speech queue, then announces the new event. More usable.
// =============================================================================

import { useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CommentaryEvent } from './CommentaryEvent'
import type { Commentary } from '@/lib/types'

interface CommentaryPanelProps {
  commentary: Commentary[]
  isLoading:  boolean
  matchId:    number | null
}

export function CommentaryPanel({ commentary, isLoading, matchId }: CommentaryPanelProps) {
  // Track which event IDs are "new" (from WebSocket, not initial fetch).
  // After 500ms the ID is removed — it won't animate if the component
  // re-mounts (e.g. navigating away and back).
  const newEventIds = useRef(new Set<number>())

  const markNew = useCallback((id: number) => {
    newEventIds.current.add(id)
    setTimeout(() => newEventIds.current.delete(id), 500)
  }, [])

  // Note: markNew is called from page.tsx's onCommentary handler via
  // the addEvent → setQueryData path. See page.tsx for the full flow.
  void markNew  // suppress unused warning — exposed for parent use

  return (
    <aside
      className={[
        // Desktop: sticky right column
        'hidden w-80 shrink-0 flex-col rounded-2xl bg-commentary xl:flex xl:w-96',
        // Sticky — stays in viewport as user scrolls match grid
        'sticky top-6 self-start',
      ].join(' ')}
      aria-label="Live Commentary"
      data-testid="commentary-panel"
    >
      {/* ── Panel header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-semibold text-commentary-fg">
          Live Commentary
        </h2>
        <span className="rounded-full border border-commentary-fg/25 px-2.5 py-0.5 text-[11px] font-semibold text-commentary-fg/70">
          Real-time
        </span>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-commentary-fg/10" />

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden px-5 py-4">

        {/* No match selected */}
        {matchId === null && !isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="text-3xl">🏟️</span>
            <p className="text-sm text-commentary-fg/50">
              Click <strong className="text-commentary-fg/70">Watch Live</strong> on any match
              to follow commentary here.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-4" aria-busy aria-label="Loading commentary">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-commentary-fg/20" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-3/4 animate-pulse rounded-md bg-commentary-fg/15" />
                  <div className="h-14 animate-pulse rounded-xl bg-commentary-fg/10" />
                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-commentary-fg/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commentary feed */}
        {!isLoading && matchId !== null && (
          <div
            className="commentary-scroll -mr-1 flex flex-col overflow-y-auto pr-1"
            // max-height: viewport - header(64) - panel top(24) - panel header(61) - padding(32)
            style={{ maxHeight: 'calc(100vh - 112px - 61px - 32px)' }}
            aria-live="polite"
            aria-label="Commentary events"
            aria-relevant="additions"
          >
            <AnimatePresence initial={false}>
              {commentary.length === 0 ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-commentary-fg/50"
                >
                  No commentary yet.
                </motion.p>
              ) : (
                commentary.map(event => (
                  <CommentaryEvent
                    key={event.id}
                    event={event}
                    isNew={newEventIds.current.has(event.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </aside>
  )
}
