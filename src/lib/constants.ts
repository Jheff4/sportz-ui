// =============================================================================
// constants.ts — environment-aware URLs and app-wide constants
// =============================================================================
// NEXT_PUBLIC_ prefix is required for any env var used in the browser.
// Without it, Next.js strips the value on the client and it becomes undefined.
// =============================================================================

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws'

// How many matches to show per page
export const MATCHES_PER_PAGE = 6

// How many commentary events to fetch per match
export const COMMENTARY_LIMIT = 50

// WebSocket reconnection settings
export const WS_RECONNECT_DELAY_MS = 2000 // wait 2s before first retry
export const WS_RECONNECT_MAX_DELAY = 30_000 // cap backoff at 30s
export const WS_MAX_RETRIES = 10 // give up after 10 attempts

// =============================================================================
// Event type badge colours — semantic, not all-yellow.
//
// DECISION: Semantic colors over brand yellow for every event type.
// Using yellow for GOAL, YELLOW_CARD, SUBSTITUTION, and FOUL simultaneously
// makes them visually identical — defeating the purpose of the badge.
// Each color now maps to real-world meaning:
//   green  = positive/scoring event (GOAL, SIX, FOUR)
//   amber  = caution (YELLOW_CARD, FOUL)
//   red    = severe (RED_CARD, PENALTY, WICKET)
//   blue   = personnel change (SUBSTITUTION)
//   neutral = procedural (KICKOFF, HALF_TIME, START)
// This is consistent with how broadcast graphics work on TV.
//
// Format: Tailwind classes for light mode. Dark mode handled via dark: prefix
// where the bg would be unreadable without adjustment.
// =============================================================================
export const EVENT_TYPE_COLORS: Record<string, string> = {
  GOAL: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  YELLOW_CARD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  RED_CARD: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  SUBSTITUTION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  FOUL: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  KICKOFF: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  PENALTY: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  CORNER: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  OFFSIDE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  HALF_TIME: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  FULL_TIME: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  WHISTLE: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  WICKET: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  SIX: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  FOUR: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  OVER_END: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  BUILD_UP: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  START: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  CARD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',

  // ── Basketball ──
  FIELD_GOAL: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  THREE_POINTER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  FREE_THROW: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  REBOUND: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  STEAL: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  BLOCK: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  TIMEOUT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',

  // ── Rugby ──
  TRY: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  CONVERSION: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  SCRUM: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  LINEOUT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  RUCK: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  KNOCK_ON: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',

  // ── Cricket ──
  RUN: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  RUNS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  DOT_BALL: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  APPEAL: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',

  // ── Tennis ──
  GAME: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  ACE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  RALLY: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  BREAK_POINT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  DOUBLE_FAULT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',

  // ── Football (extra) ──
  SAVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
}

// =============================================================================
// Per-sport identity for the SportBadge — an icon + accent color per sport,
// so a glance tells you the sport. Keyed loosely (string) with a fallback in
// the component, since the backend `sport` is free text.
// =============================================================================
export const SPORT_META: Record<string, { icon: string; badge: string }> = {
  football: {
    icon: '⚽',
    badge:
      'border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  basketball: {
    icon: '🏀',
    badge:
      'border-orange-500/30 text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400',
  },
  cricket: {
    icon: '🏏',
    badge: 'border-sky-500/30 text-sky-700 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400',
  },
  tennis: {
    icon: '🎾',
    badge: 'border-lime-500/30 text-lime-700 bg-lime-50 dark:bg-lime-900/30 dark:text-lime-400',
  },
  rugby: {
    icon: '🏉',
    badge:
      'border-purple-500/30 text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400',
  },
}
