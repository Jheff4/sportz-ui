'use client'

// =============================================================================
// QueryProvider.tsx
// =============================================================================
//
// WHAT THIS DOES:
// Creates a single QueryClient and makes it available to every component in the
// app via React context. Any component can then call useQuery(), useMutation(),
// or useQueryClient() without passing anything through props.
//
// WHY 'use client':
// QueryClientProvider uses React context internally. Context requires a client
// component boundary in Next.js App Router — server components can't use
// context because they render on the server with no interactivity.
//
// WHY useState FOR THE QueryClient:
// If we wrote `const queryClient = new QueryClient()` at module level, Next.js
// would share that single instance across ALL users in production (server-side
// module caching). Each browser tab needs its own isolated cache. useState
// ensures a fresh QueryClient is created per component mount (i.e. per page
// load in the browser).
//
// WHY THESE DEFAULTS:
// - staleTime: 30s  → data is considered fresh for 30 seconds after fetching.
//                     React Query won't re-fetch if you navigate away and back
//                     within that window. Good for match data that doesn't
//                     change every second (WebSocket handles live updates).
// - retry: 2        → if a request fails, retry up to 2 times before showing
//                     an error. Network blips shouldn't immediately surface.
// - refetchOnWindowFocus: false → by default React Query re-fetches when you
//                     switch tabs and come back. We use WebSocket for live
//                     updates, so this would just create redundant requests.
// =============================================================================

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:           30 * 1000, // 30 seconds
            retry:               2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/*
        React Query Devtools — only renders in development.
        In production the bundle is tree-shaken out entirely (zero cost).
        In dev it adds a floating panel (bottom-right) showing:
          - Every active query and its cache key
          - Status: fetching / fresh / stale / inactive
          - The actual data in the cache
          - How many observers (components) are watching each query
        This is invaluable for understanding what's happening with your data.
      */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
