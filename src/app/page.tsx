'use client'

// =============================================================================
// page.tsx — root orchestrator
//
// RESPONSIBILITY OF THIS FILE:
//   - Own activeMatchId state (shared across MatchGrid, CommentaryPanel, WS)
//   - Wire WebSocket callbacks → React Query cache mutations
//   - Fire PostHog analytics events
//   - Manage success/error modal visibility
//   - Decide between desktop (sticky panel) and mobile (bottom sheet) layout
//
// THIS FILE DOES NOT:
//   - Render any domain UI directly — delegates to MatchGrid / CommentaryPanel
//   - Fetch data — delegates to useMatches / useCommentary
//   - Handle reconnection — delegates to useWebSocket
//
// LAYOUT STRATEGY:
//   Desktop (xl+): side-by-side — match grid left, commentary panel sticky right
//   Tablet/Mobile:  full-width match grid, commentary as a bottom sheet
//                   that slides up when a match is selected
//
// DECISION: mobile bottom sheet via Framer Motion drag-to-dismiss.
// A bottom sheet is the mobile-native pattern for supplementary content
// (used by Google Maps, Spotify, Apple Maps). It keeps the match grid
// visible behind the sheet so users don't lose context.
// dragConstraints + onDragEnd dismisses the sheet when dragged > 80px down.
// =============================================================================

'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { usePostHog }        from 'posthog-js/react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X }                 from 'lucide-react'
import { Header }            from '@/components/layout/Header'
import { MatchGrid }         from '@/components/matches/MatchGrid'
import { CommentaryPanel }   from '@/components/commentary/CommentaryPanel'
import { CommentaryEvent }   from '@/components/commentary/CommentaryEvent'
import { SuccessModal }      from '@/components/ui/SuccessModal'
import { ErrorModal }        from '@/components/ui/ErrorModal'
import { SportzButton }      from '@/components/ui/sportz-button'
import { useWebSocket }      from '@/hooks/useWebSocket'
import { useMatches }        from '@/hooks/useMatches'
import { useCommentary }     from '@/hooks/useCommentary'
import type { Match, Commentary } from '@/lib/types'

export default function HomePage() {
  const [activeMatchId, setActiveMatchId]     = useState<number | null>(null)
  const [successMessage, setSuccessMessage]   = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal]   = useState(false)
  const [showMobileSheet, setShowMobileSheet] = useState(false)

  const posthog         = usePostHog()
  const reduceMotion    = useReducedMotion()
  const prevWsStatus    = useRef<string | null>(null)
  // Tracks which commentary event IDs should animate on entry
  const newEventIds     = useRef(new Set<number>())

  // ── Data hooks ─────────────────────────────────────────────────────────────
  const {
    matches, allMatches, page, totalPages,
    isLoading: matchesLoading, error: matchesError,
    goToPage, addMatch,
  } = useMatches()

  const {
    commentary, isLoading: commentaryLoading, addEvent,
  } = useCommentary(activeMatchId)

  // ── WebSocket callbacks ────────────────────────────────────────────────────
  const handleMatchCreated = useCallback((match: Match) => {
    addMatch(match)
    // Brief success flash — shows users the WS connection is alive
    setSuccessMessage(`New match: ${match.homeTeam} vs ${match.awayTeam}`)
  }, [addMatch])

  const handleCommentary = useCallback((event: Commentary) => {
    // Mark this event as "new" so CommentaryEvent animates its entry
    newEventIds.current.add(event.id)
    setTimeout(() => newEventIds.current.delete(event.id), 600)
    addEvent(event)
  }, [addEvent])

  const { status: wsStatus, subscribe, unsubscribe } = useWebSocket({
    onMatchCreated: handleMatchCreated,
    onCommentary:   handleCommentary,
  })

  // ── WebSocket status side effects ──────────────────────────────────────────
  useEffect(() => {
    if (wsStatus === 'disconnected') {
      setShowErrorModal(true)
    }
    if (prevWsStatus.current === 'reconnecting' && wsStatus === 'connected') {
      // Reconnected — dismiss the error modal automatically
      setShowErrorModal(false)
      setSuccessMessage('Reconnected to live data')
      posthog?.capture('ws_reconnected')
    }
    prevWsStatus.current = wsStatus
  }, [wsStatus, posthog])

  // ── Match interaction handlers ─────────────────────────────────────────────
  const handleWatch = useCallback((matchId: number) => {
    if (activeMatchId !== null && activeMatchId !== matchId) {
      unsubscribe(activeMatchId)
    }
    setActiveMatchId(matchId)
    subscribe(matchId)
    setShowMobileSheet(true)   // open bottom sheet on mobile

    const match = allMatches.find(m => m.id === matchId)
    posthog?.capture('match_watched', {
      match_id:     matchId,
      sport:        match?.sport,
      home_team:    match?.homeTeam,
      away_team:    match?.awayTeam,
      match_status: match?.status,
    })
  }, [activeMatchId, subscribe, unsubscribe, allMatches, posthog])

  const handleClose = useCallback(() => {
    if (activeMatchId !== null) {
      unsubscribe(activeMatchId)
      posthog?.capture('match_closed', { match_id: activeMatchId })
    }
    setActiveMatchId(null)
    setShowMobileSheet(false)
  }, [activeMatchId, unsubscribe, posthog])

  const activeMatch = allMatches.find(m => m.id === activeMatchId)

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        wsStatus={wsStatus}
        matchCount={allMatches.length}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      {/*
        DECISION: max-w-7xl centred with px-6 — matches the header container.
        The match grid and commentary panel always align with the header logo
        and status badge regardless of viewport width.
      */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-6">

        {/* ── Match grid — takes all remaining horizontal space ───────── */}
        <MatchGrid
          matches={matches}
          activeMatchId={activeMatchId}
          page={page}
          totalPages={totalPages}
          isLoading={matchesLoading}
          error={matchesError}
          onWatch={handleWatch}
          onClose={handleClose}
          onPrev={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
        />

        {/* ── Desktop commentary panel — hidden on mobile (xl:flex) ────── */}
        <CommentaryPanel
          commentary={commentary}
          isLoading={commentaryLoading}
          matchId={activeMatchId}
        />
      </main>

      {/* ── Mobile bottom sheet — visible only on < xl screens ─────────── */}
      {/*
        DECISION: Separate mobile bottom sheet, not responsive visibility on
        CommentaryPanel. The panel and the sheet have different DOM positions,
        different animations, and different interaction models. Cramming both
        into one component with conditional classes would create a mess.
        Two purpose-built components, conditionally rendered by viewport.
      */}
      <AnimatePresence>
        {showMobileSheet && activeMatchId !== null && (
          <>
            {/* Scrim — dims the match grid behind the sheet */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/40 xl:hidden"
              onClick={handleClose}
              aria-hidden
            />

            {/* Sheet — slides up from bottom */}
            <motion.aside
              key="sheet"
              role="dialog"
              aria-label="Live Commentary"
              aria-modal
              drag="y"
              dragConstraints={{ top: 0 }}
              // Dismiss if dragged > 80px downward
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) handleClose()
              }}
              initial={!reduceMotion ? { y: '100%' } : false}
              animate={{ y: 0 }}
              exit={!reduceMotion    ? { y: '100%' } : undefined}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 flex max-h-[75vh] flex-col rounded-t-3xl bg-commentary xl:hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="h-1 w-12 rounded-full bg-commentary-fg/20" aria-hidden />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex flex-col">
                  <h2 className="text-sm font-semibold text-commentary-fg">
                    Live Commentary
                  </h2>
                  {activeMatch && (
                    <p className="text-xs text-commentary-fg/60">
                      {activeMatch.homeTeam} vs {activeMatch.awayTeam}
                    </p>
                  )}
                </div>
                <SportzButton
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  aria-label="Close commentary"
                  className="h-8 w-8 p-0 min-w-0 text-commentary-fg hover:bg-commentary-fg/10"
                >
                  <X size={16} />
                </SportzButton>
              </div>

              {/* Divider */}
              <div className="mx-5 h-px bg-commentary-fg/10" />

              {/* Commentary feed — identical to desktop but in the sheet */}
              <div
                className="commentary-scroll flex-1 overflow-y-auto px-5 py-4"
                aria-live="polite"
                aria-label="Commentary events"
              >
                {commentaryLoading ? (
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-commentary-fg/20" />
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="h-3 w-3/4 animate-pulse rounded bg-commentary-fg/15" />
                          <div className="h-14 animate-pulse rounded-xl bg-commentary-fg/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : commentary.length === 0 ? (
                  <p className="text-center text-sm text-commentary-fg/50">
                    No commentary yet.
                  </p>
                ) : (
                  commentary.map(event => (
                    <CommentaryEvent
                      key={event.id}
                      event={event}
                      isNew={newEventIds.current.has(event.id)}
                    />
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <SuccessModal
        isVisible={!!successMessage}
        message={successMessage ?? ''}
        onDismiss={() => setSuccessMessage(null)}
      />

      <ErrorModal
        isVisible={showErrorModal}
        onRetry={() => {
          setShowErrorModal(false)
          window.location.reload()
        }}
        onDismiss={() => setShowErrorModal(false)}
      />
    </div>
  )
}
