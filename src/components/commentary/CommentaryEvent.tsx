'use client'

// =============================================================================
// CommentaryEvent.tsx — one item in the live commentary timeline
//
// DECISION: animate y not x for new events.
// The previous implementation slid events in from the right (x: 32 → 0).
// Horizontal motion in a vertical feed feels directionally wrong — it implies
// the event came from "somewhere else" rather than appearing at the top.
// A gentle upward rise (y: 12 → 0) matches the natural expectation that new
// information emerges from above in a top-ordered feed.
//
// DECISION: React.memo on this component.
// Once a commentary event is rendered, it never changes — commentary events
// are immutable (no edits). Without memo, every new WS event prepended to
// the list causes ALL existing events to re-render (because the parent list
// re-renders). With memo, only the new event at position 0 renders. In a
// long match with 200+ events, this is a 200x reduction in renders.
//
// DECISION: The timeline line is a full-height div clipped by the parent.
// The vertical line connects dots visually. Using border-left on the container
// would require careful offset math. A full-height div that clips naturally
// in the overflow-hidden parent is cleaner and works without JS measurement.
//
// DECISION: shortTag map is a plain object lookup not a switch statement.
// Both are O(1). The object literal is more readable and can be extended
// without touching control flow.
// =============================================================================

import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EventTypeBadge } from './EventTypeBadge'
import type { Commentary } from '@/lib/types'

// Short label at the bottom of the event — matches the design
const SHORT_TAG: Record<string, string> = {
  SUBSTITUTION: 'SUB',
  YELLOW_CARD: 'CARD',
  RED_CARD: 'RED CARD',
  GOAL: 'GOAL',
  FOUL: 'FOUL',
  KICKOFF: 'START',
  HALF_TIME: 'HT',
  FULL_TIME: 'FT',
  PENALTY: 'PEN',
  WICKET: 'WICKET',
  SIX: 'SIX',
  FOUR: 'FOUR',
  OVER_END: 'OVER',
  BUILD_UP: 'BUILD',
  START: 'START',
  CARD: 'CARD',
  // Basketball
  FIELD_GOAL: 'BUCKET',
  THREE_POINTER: '3 PTS',
  FREE_THROW: 'FT',
  REBOUND: 'REB',
  STEAL: 'STEAL',
  BLOCK: 'BLOCK',
  TIMEOUT: 'TO',
  // Rugby
  TRY: 'TRY',
  CONVERSION: 'CONV',
  SCRUM: 'SCRUM',
  LINEOUT: 'LINE',
  RUCK: 'RUCK',
  KNOCK_ON: 'KNOCK',
  // Cricket
  RUN: 'RUN',
  RUNS: 'RUNS',
  DOT_BALL: 'DOT',
  APPEAL: 'APPEAL',
  // Tennis
  GAME: 'GAME',
  ACE: 'ACE',
  RALLY: 'RALLY',
  BREAK_POINT: 'BREAK',
  DOUBLE_FAULT: 'FAULT',
  // Football (extra)
  SAVE: 'SAVE',
  CORNER: 'CORNER',
  OFFSIDE: 'OFF',
}

interface CommentaryEventProps {
  event: Commentary
  isNew?: boolean // true only for the first render (WS-injected event)
}

function CommentaryEventBase({ event, isNew = false }: CommentaryEventProps) {
  const { minute, sequence, period, eventType, actor, team, message, createdAt } = event
  const reduceMotion = useReducedMotion()

  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // New events animate in. Pre-existing events (from initial fetch) render
  // statically — no animation needed, they're already "settled" history.
  const shouldAnimate = isNew && !reduceMotion

  return (
    <motion.div
      layout={false} // DECISION: layout=false prevents Framer from measuring
      // and animating every item's position when a new one is
      // prepended. layout=true would cause all 50+ existing
      // items to animate downward simultaneously — jank city.
      initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative flex gap-3 pb-4"
      data-testid={`commentary-event-${event.id}`}
    >
      {/* ── Timeline column ────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center">
        {/* Yellow dot — the "now" marker on the timeline */}
        <span className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-brand shadow-sm shadow-brand/30" />
        {/* Connector line fills remaining height — clipped by parent's pb-4 */}
        <span className="mt-1 w-px flex-1 bg-border/50" aria-hidden />
      </div>

      {/* ── Event content ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Meta row: time, minute badge, seq, period, event type */}
        <div className="flex flex-wrap items-center gap-1.5">
          <time
            dateTime={createdAt}
            className="font-mono text-[11px] text-muted-foreground tabular-nums"
          >
            {time}
          </time>

          {minute != null && (
            <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-background">
              {minute}&apos;
            </span>
          )}

          {sequence != null && (
            <span className="text-[11px] text-muted-foreground">Seq {sequence}</span>
          )}

          {period && <span className="text-[11px] text-muted-foreground">{period}</span>}

          <EventTypeBadge eventType={eventType} />
        </div>

        {/* Actor · Team */}
        {(actor ?? team) && (
          <p className="text-xs font-semibold text-foreground/80">
            {[actor, team].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Message box — slightly inset from the timeline */}
        <div className="rounded-xl bg-background/70 px-3 py-2.5 text-sm text-foreground shadow-sm ring-1 ring-border/50 dark:bg-card/80">
          {message}
        </div>

        {/* Short tag — bottom label */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {SHORT_TAG[eventType] ?? eventType}
        </span>
      </div>
    </motion.div>
  )
}

// Memo: commentary events are immutable — once rendered, they never change.
// This prevents the O(n) re-render cascade on every new WS event.
export const CommentaryEvent = memo(
  CommentaryEventBase,
  (prev, next) => prev.event.id === next.event.id && prev.isNew === next.isNew
)
