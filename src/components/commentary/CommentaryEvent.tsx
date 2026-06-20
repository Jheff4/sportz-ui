'use client'

// =============================================================================
// CommentaryEvent.tsx — one item in the commentary timeline
// Layout from the design:
//   [yellow dot] [time]  [24']  [Seq 24]  [1st half]  [EVENT_TYPE badge]
//   Actor · Team
//   [message box]
//   [short tag]
// =============================================================================

import { motion } from 'framer-motion'
import { EventTypeBadge } from './EventTypeBadge'
import type { Commentary } from '@/lib/types'

interface CommentaryEventProps {
  event: Commentary
}

// Short label shown below the message box (SUB, CARD, GOAL, etc.)
function shortTag(eventType: string): string {
  const map: Record<string, string> = {
    SUBSTITUTION: 'SUB',
    YELLOW_CARD:  'CARD',
    RED_CARD:     'CARD',
    GOAL:         'GOAL',
    FOUL:         'FOUL',
    KICKOFF:      'START',
    HALF_TIME:    'HALF',
    FULL_TIME:    'FULL',
    PENALTY:      'PEN',
    WICKET:       'WICKET',
    SIX:          'SIX',
    FOUR:         'FOUR',
    OVER_END:     'OVER',
    BUILD_UP:     'BUILD_UP',
    START:        'START',
    CARD:         'CARD',
  }
  return map[eventType] ?? eventType
}

export function CommentaryEvent({ event }: CommentaryEventProps) {
  const { minute, sequence, period, eventType, actor, team, message, createdAt } = event

  const time = new Date(createdAt).toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    // Slide in from right when a new event is added via AnimatePresence
    <motion.div
      layout
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0  }}
      exit={{    opacity: 0, x: 32 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="relative flex gap-3"
      data-testid={`commentary-event-${event.id}`}
    >
      {/* ── Timeline dot ── */}
      <div className="relative flex flex-col items-center">
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand shadow-sm shadow-brand/40" />
        {/* Vertical connector line — hidden on last item via CSS in parent */}
        <div className="mt-1 w-px flex-1 bg-border/60" />
      </div>

      {/* ── Event content ── */}
      <div className="mb-4 flex flex-1 flex-col gap-1.5 pb-0.5">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-mono">{time}</span>
          {minute != null && (
            <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
              {minute}&apos;
            </span>
          )}
          {sequence != null && <span>Seq {sequence}</span>}
          {period    && <span>{period}</span>}
          <EventTypeBadge eventType={eventType} />
        </div>

        {/* Actor · Team */}
        {(actor ?? team) && (
          <p className="text-xs font-semibold text-foreground/80">
            {[actor, team].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Message box */}
        <div className="rounded-lg bg-background/60 px-3 py-2 text-sm text-foreground shadow-sm ring-1 ring-border/50 dark:bg-card">
          {message}
        </div>

        {/* Short tag */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {shortTag(eventType)}
        </span>
      </div>
    </motion.div>
  )
}
