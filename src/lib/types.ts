// =============================================================================
// types.ts — shared TypeScript types across the entire frontend
// These mirror the backend Drizzle schema exactly so the data shapes match.
// =============================================================================

// ── Match ─────────────────────────────────────────────────────────────────────

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export type Sport = 'football' | 'cricket' | 'basketball' | 'tennis' | 'rugby'

export interface Match {
  id: number
  sport: Sport
  homeTeam: string
  awayTeam: string
  status: MatchStatus
  startTime: string   // ISO 8601
  endTime: string | null
  homeScore: number
  awayScore: number
  createdAt: string
}

// ── Commentary ────────────────────────────────────────────────────────────────

// Every event type the backend can emit
export type EventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'FOUL'
  | 'KICKOFF'
  | 'WHISTLE'
  | 'PENALTY'
  | 'CORNER'
  | 'OFFSIDE'
  | 'HALF_TIME'
  | 'FULL_TIME'
  | 'WICKET'
  | 'SIX'
  | 'FOUR'
  | 'OVER_END'
  | 'BUILD_UP'
  | 'START'
  | 'CARD'

export interface Commentary {
  id: number
  matchId: number
  minute: number | null
  sequence: number
  period: string | null
  eventType: EventType
  actor: string | null
  team: string | null
  message: string
  metadata: Record<string, unknown> | null
  tags: string[]
  createdAt: string
}

// ── WebSocket messages ────────────────────────────────────────────────────────
// Every message type the backend can send to the client

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

export type WsIncomingMessage =
  | { type: 'welcome' }
  | { type: 'subscribed';   matchId: number }
  | { type: 'unsubscribed'; matchId: number }
  | { type: 'match_created'; data: Match }
  | { type: 'commentary';    data: Commentary }
  | { type: 'error';         message: string }

// ── API responses ─────────────────────────────────────────────────────────────

export interface MatchesResponse {
  data: Match[]
}

export interface CommentaryResponse {
  data: Commentary[]
}
