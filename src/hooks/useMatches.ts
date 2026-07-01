'use client'

// =============================================================================
// useMatches.ts — React Query version
// =============================================================================
//
// BEFORE (manual): 55 lines managing useState, useEffect, AbortController,
//   isLoading, error, and a separate addMatch callback threaded through props.
//
// AFTER (React Query): the queryFn is the only business logic we write.
//   React Query handles caching, loading state, error state, deduplication,
//   retries, and AbortController automatically.
//
// KEY DECISION — queryKey: ['matches']:
//   The query key is the cache address. Any code anywhere in the app that
//   calls useQuery({ queryKey: ['matches'] }) gets the SAME cached result —
//   no duplicate requests. When a WebSocket event creates a new match, we
//   call queryClient.setQueryData(['matches'], ...) and every component
//   subscribed to that key re-renders with the updated data instantly.
//
// KEY DECISION — client-side pagination:
//   We fetch all matches once (limit=100) and paginate in the browser.
//   Why not server-side pagination? Because WebSocket events add new matches
//   at runtime. If we fetched page 1 from the server, a WS-created match
//   would need a refetch to appear. With client-side pagination, setQueryData
//   prepends the match and it immediately shows on page 1.
// =============================================================================

import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { API_URL, MATCHES_PER_PAGE } from '@/lib/constants'
import type { Match, MatchesResponse } from '@/lib/types'

async function fetchMatches(): Promise<MatchesResponse> {
  const res = await fetch(`${API_URL}/matches?limit=100`)
  if (!res.ok) throw new Error(`Failed to fetch matches: HTTP ${res.status}`)
  return res.json() as Promise<MatchesResponse>
}

export function useMatches() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
  })

  const allMatches = data?.data ?? []
  const totalPages = Math.max(1, Math.ceil(allMatches.length / MATCHES_PER_PAGE))

  // Current page slice — computed from cache, not separate state
  const matches = allMatches.slice((page - 1) * MATCHES_PER_PAGE, page * MATCHES_PER_PAGE)

  const goToPage = useCallback(
    (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
    [totalPages]
  )

  // Called by the WebSocket onMatchCreated handler in page.tsx.
  // setQueryData writes directly into the React Query cache — no useState,
  // no prop drilling. Every component using useQuery(['matches']) re-renders.
  const addMatch = useCallback(
    (match: Match) => {
      queryClient.setQueryData<MatchesResponse>(['matches'], (old) => {
        // Dedup by id — a match_created could arrive twice; don't duplicate the
        // card (which would also collide on the React key).
        if (old?.data.some((m) => m.id === match.id)) return old
        return { data: [match, ...(old?.data ?? [])] }
      })
    },
    [queryClient]
  )

  // Called by the WebSocket onScoreUpdate handler. Replaces the match in place
  // (same ['matches'] cache), so its card re-renders with the new score — the
  // MatchCard memo comparator already watches homeScore/awayScore.
  const updateMatch = useCallback(
    (match: Match) => {
      queryClient.setQueryData<MatchesResponse>(['matches'], (old) =>
        old ? { data: old.data.map((m) => (m.id === match.id ? match : m)) } : { data: [match] }
      )
    },
    [queryClient]
  )

  return {
    matches,
    allMatches,
    page,
    totalPages,
    isLoading,
    error: error ? 'Failed to load matches. Is the backend running?' : null,
    goToPage,
    addMatch,
    updateMatch,
  }
}
