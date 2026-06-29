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
}
