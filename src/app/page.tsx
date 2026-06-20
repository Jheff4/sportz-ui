'use client'

// =============================================================================
// page.tsx — root page, wires all hooks + components together
//
// Data flow:
//   useWebSocket → onMatchCreated → queryClient cache (['matches'])
//   useWebSocket → onCommentary   → queryClient cache (['commentary', matchId])
//   user clicks "Watch Live"      → setActiveMatchId → useCommentary enabled
//   user clicks "Close"           → unsubscribe(matchId) → setActiveMatchId(null)
//
// Observability events fired here (PostHog):
//   match_watched    → user clicked Watch Live
//   match_closed     → user clicked Close
//   ws_reconnected   → WebSocket recovered from disconnect
// =============================================================================

import { useCallback, useState, useEffect, useRef } from 'react'
import { usePostHog }      from 'posthog-js/react'
import { Header }          from '@/components/layout/Header'
import { MatchGrid }       from '@/components/matches/MatchGrid'
import { CommentaryPanel } from '@/components/commentary/CommentaryPanel'
import { useWebSocket }    from '@/hooks/useWebSocket'
import { useMatches }      from '@/hooks/useMatches'
import { useCommentary }   from '@/hooks/useCommentary'
import type { Match, Commentary } from '@/lib/types'

export default function HomePage() {
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null)
  const posthog  = usePostHog()
  const prevWsStatus = useRef<string | null>(null)

  // ── Commentary ─────────────────────────────────────────────────────────────
  const {
    commentary,
    isLoading: commentaryLoading,
    addEvent,
  } = useCommentary(activeMatchId)

  // ── Matches ─────────────────────────────────────────────────────────────────
  const {
    matches,
    page,
    totalPages,
    isLoading: matchesLoading,
    error,
    goToPage,
    addMatch,
  } = useMatches()

  // ── WebSocket ────────────────────────────────────────────────────────────────
  const handleMatchCreated = useCallback((match: Match) => {
    addMatch(match)
  }, [addMatch])

  const handleCommentary = useCallback((event: Commentary) => {
    addEvent(event)
  }, [addEvent])

  const { status: wsStatus, subscribe, unsubscribe } = useWebSocket({
    onMatchCreated: handleMatchCreated,
    onCommentary:   handleCommentary,
  })

  // ── PostHog: track WebSocket reconnection ─────────────────────────────────
  // WHY: reconnections are invisible to users but signal network instability.
  // Tracking them in PostHog lets you correlate "users who experienced WS
  // reconnections" with "users who had lower engagement or higher bounce rate".
  useEffect(() => {
    if (prevWsStatus.current === 'reconnecting' && wsStatus === 'connected') {
      posthog?.capture('ws_reconnected', {
        previous_status: prevWsStatus.current,
      })
    }
    prevWsStatus.current = wsStatus
  }, [wsStatus, posthog])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleWatch = useCallback((matchId: number) => {
    if (activeMatchId !== null && activeMatchId !== matchId) {
      unsubscribe(activeMatchId)
    }
    setActiveMatchId(matchId)
    subscribe(matchId)

    // PostHog event — tells you which matches users actually watch.
    // WHY capture here not in MatchCard: page.tsx has match context.
    // In PostHog dashboard: Insights → Breakdown by sport → see which
    // sport gets watched most.
    const match = matches.find(m => m.id === matchId)
    posthog?.capture('match_watched', {
      match_id:   matchId,
      sport:      match?.sport,
      home_team:  match?.homeTeam,
      away_team:  match?.awayTeam,
      match_status: match?.status,
    })
  }, [activeMatchId, subscribe, unsubscribe, matches, posthog])

  const handleClose = useCallback(() => {
    if (activeMatchId !== null) {
      unsubscribe(activeMatchId)
      posthog?.capture('match_closed', { match_id: activeMatchId })
    }
    setActiveMatchId(null)
  }, [activeMatchId, unsubscribe, posthog])

  // Total count for the API badge — includes all matches, not just current page
  const allMatchesCount = matches.length  // proxy — full count comes from API

  return (
    <div className="flex min-h-screen flex-col">
      <Header wsStatus={wsStatus} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-6">
        {/* ── Left: match grid (takes remaining space) ── */}
        <MatchGrid
          matches={matches}
          activeMatchId={activeMatchId}
          totalCount={allMatchesCount}
          page={page}
          totalPages={totalPages}
          isLoading={matchesLoading}
          error={error}
          onWatch={handleWatch}
          onClose={handleClose}
          onPrev={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
        />

        {/* ── Right: live commentary panel (fixed width) ── */}
        <CommentaryPanel
          commentary={commentary}
          isLoading={commentaryLoading}
          matchId={activeMatchId}
        />
      </main>
    </div>
  )
}
