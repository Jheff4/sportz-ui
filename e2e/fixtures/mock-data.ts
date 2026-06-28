// =============================================================================
// mock-data.ts — fake API payloads used by the mocked test tier
// =============================================================================
// These match the real backend's response shapes (Match, Commentary) so the
// frontend can't tell the difference. Keeping them here (not inline in tests)
// means every test shares one consistent, realistic dataset.
// =============================================================================

import type { Match, Commentary } from '@/lib/types'

// A small, deterministic set of matches. IDs are stable so tests can target
// `match-card-1` etc. without guessing.
export const mockMatches: Match[] = [
  {
    id: 1,
    sport: 'football',
    homeTeam: 'Arsenal FC',
    awayTeam: 'Manchester City',
    status: 'live',
    startTime: new Date(Date.now() - 30 * 60_000).toISOString(),
    endTime: new Date(Date.now() + 60 * 60_000).toISOString(),
    homeScore: 1,
    awayScore: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    sport: 'cricket',
    homeTeam: 'Forest Rangers',
    awayTeam: 'Sunset Blazers',
    status: 'live',
    startTime: new Date(Date.now() - 60 * 60_000).toISOString(),
    endTime: new Date(Date.now() + 120 * 60_000).toISOString(),
    homeScore: 22,
    awayScore: 0,
    createdAt: new Date().toISOString(),
  },
]

// Commentary for match 1, newest-first (the order the real API returns).
export const mockCommentary: Commentary[] = [
  {
    id: 101,
    matchId: 1,
    minute: 24,
    sequence: 24,
    period: '1st half',
    eventType: 'GOAL',
    actor: 'Bukayo Saka',
    team: 'Arsenal FC',
    message: 'A composed finish from close range.',
    metadata: null,
    tags: ['goal', 'first-half'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 100,
    matchId: 1,
    minute: 12,
    sequence: 12,
    period: '1st half',
    eventType: 'YELLOW_CARD',
    actor: 'Rayan Cherki',
    team: 'Manchester City',
    message: 'Booked for a rash tackle.',
    metadata: null,
    tags: ['card'],
    createdAt: new Date().toISOString(),
  },
]

// A brand-new event a test can "push" over the mocked WebSocket to verify the
// live-update path (used in later WS tests).
export const newCommentaryEvent: Commentary = {
  id: 102,
  matchId: 1,
  minute: 31,
  sequence: 31,
  period: '1st half',
  eventType: 'SUBSTITUTION',
  actor: 'Martin Ødegaard',
  team: 'Arsenal FC',
  message: 'Fresh legs coming on to change the tempo.',
  metadata: null,
  tags: ['sub'],
  createdAt: new Date().toISOString(),
}
