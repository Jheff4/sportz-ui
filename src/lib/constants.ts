// =============================================================================
// constants.ts — environment-aware URLs and app-wide constants
// =============================================================================
// NEXT_PUBLIC_ prefix is required for any env var used in the browser.
// Without it, Next.js strips the value on the client and it becomes undefined.
// =============================================================================

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws'

// How many matches to show per page
export const MATCHES_PER_PAGE = 6

// How many commentary events to fetch per match
export const COMMENTARY_LIMIT = 50

// WebSocket reconnection settings
export const WS_RECONNECT_DELAY_MS  = 2000   // wait 2s before first retry
export const WS_RECONNECT_MAX_DELAY = 30_000  // cap backoff at 30s
export const WS_MAX_RETRIES         = 10      // give up after 10 attempts

// Colors for each event type badge — used in CommentaryEvent + EventTypeBadge
export const EVENT_TYPE_COLORS: Record<string, string> = {
  GOAL:         'bg-brand text-black',
  YELLOW_CARD:  'bg-yellow-400 text-black',
  RED_CARD:     'bg-red-500 text-white',
  SUBSTITUTION: 'bg-brand text-black',
  FOUL:         'bg-orange-400 text-black',
  KICKOFF:      'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black',
  PENALTY:      'bg-red-400 text-white',
  CORNER:       'bg-sky-400 text-white',
  OFFSIDE:      'bg-purple-400 text-white',
  HALF_TIME:    'bg-neutral-500 text-white',
  FULL_TIME:    'bg-neutral-700 text-white',
  WHISTLE:      'bg-neutral-400 text-black',
  WICKET:       'bg-orange-500 text-white',
  SIX:          'bg-brand text-black',
  FOUR:         'bg-emerald-400 text-black',
  OVER_END:     'bg-teal-500 text-white',
  BUILD_UP:     'bg-sky-300 text-black',
  START:        'bg-emerald-500 text-white',
  CARD:         'bg-yellow-400 text-black',
}
