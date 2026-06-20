'use client'

// =============================================================================
// useCommentary.ts — React Query version
// =============================================================================
//
// KEY DECISION — enabled: matchId !== null:
//   This is the most important line in this hook. When no match is selected,
//   matchId is null. Without `enabled`, useQuery would fire a request to
//   /matches/null/commentary — which would 404. The `enabled` flag tells
//   React Query "don't even attempt this query until the condition is true."
//   The moment a user clicks "Watch Live", matchId becomes a number, enabled
//   flips to true, and the fetch fires automatically. No useEffect, no
//   conditional fetch logic — one prop does it all.
//
// KEY DECISION — queryKey: ['commentary', matchId]:
//   Including matchId in the key means each match gets its own cache entry.
//   Switch from match 1 to match 2? React Query fetches match 2's commentary.
//   Switch back to match 1? Instantly served from cache (no re-fetch within
//   staleTime). This is the stale-while-revalidate pattern for free.
//
// KEY DECISION — addEvent writes to the cache:
//   When a WebSocket commentary event arrives, we call setQueryData to prepend
//   it to ['commentary', matchId]. No useState, no lifting state up to page.tsx.
//   The panel re-renders immediately with the new event at the top.
// =============================================================================

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { API_URL, COMMENTARY_LIMIT } from '@/lib/constants'
import type { Commentary, CommentaryResponse } from '@/lib/types'

async function fetchCommentary(matchId: number): Promise<CommentaryResponse> {
  const res = await fetch(
    `${API_URL}/matches/${matchId}/commentary?limit=${COMMENTARY_LIMIT}`,
  )
  if (!res.ok) throw new Error(`Failed to fetch commentary: HTTP ${res.status}`)
  return res.json() as Promise<CommentaryResponse>
}

export function useCommentary(matchId: number | null) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['commentary', matchId],
    queryFn:  () => fetchCommentary(matchId!), // matchId is never null here — enabled guards it
    enabled:  matchId !== null,
  })

  const commentary = data?.data ?? []

  // Prepend a live WS event directly into the query cache.
  // Only acts if the event belongs to the currently selected match
  // (the queryKey already scopes it, but we double-check for safety).
  const addEvent = useCallback(
    (event: Commentary) => {
      if (event.matchId !== matchId) return
      queryClient.setQueryData<CommentaryResponse>(
        ['commentary', matchId],
        old => ({ data: [event, ...(old?.data ?? [])] }),
      )
    },
    [queryClient, matchId],
  )

  return {
    commentary,
    isLoading,
    error: error ? 'Failed to load commentary.' : null,
    addEvent,
  }
}
