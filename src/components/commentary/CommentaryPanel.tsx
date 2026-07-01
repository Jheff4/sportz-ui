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
// DECISION: newEventIds comes from the parent as a prop, not a local ref.
// page.tsx owns the set of "new" event IDs (it's the one receiving WS events)
// and tracks it in state, so the desktop panel and the mobile sheet share one
// source of truth. Reading a ref's .current during render is also disallowed by
// React's rules; a plain prop sidesteps that.
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

import { AnimatePresence, motion } from 'framer-motion'
import { CommentaryEvent } from './CommentaryEvent'
import type { Commentary } from '@/lib/types'

interface CommentaryPanelProps {
  commentary: Commentary[]
  isLoading: boolean
  matchId: number | null
  // IDs of events that just arrived over the WebSocket, for the entry animation.
  newEventIds: Set<number>
}

export function CommentaryPanel({
  commentary,
  isLoading,
  matchId,
  newEventIds,
}: CommentaryPanelProps) {
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
        <h2 className="text-base font-semibold text-commentary-fg">Live Commentary</h2>
        <span className="rounded-full border border-commentary-fg/25 px-2.5 py-0.5 text-[11px] font-semibold text-commentary-fg/70">
          Real-time
        </span>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-commentary-fg/10" />

      {/* ── Body ──────────────────────────────────────────────────────────
          No horizontal padding here: the scroll container below spans the full
          width so its scrollbar sits flush on the panel's right EDGE. Inner
          content carries its own left/right padding instead. */}
      <div className="flex flex-1 flex-col overflow-hidden py-4">
        {/* No match selected */}
        {matchId === null && !isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="text-3xl">🏟️</span>
            <p className="text-sm text-commentary-fg/50">
              Click <strong className="text-commentary-fg/70">Watch Live</strong> on any match to
              follow commentary here.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-4 px-5" aria-busy aria-label="Loading commentary">
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
            className="commentary-scroll flex flex-col overflow-y-auto px-5"
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
                commentary.map((event) => (
                  <CommentaryEvent key={event.id} event={event} isNew={newEventIds.has(event.id)} />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </aside>
  )
}
