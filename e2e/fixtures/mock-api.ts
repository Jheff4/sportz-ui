// =============================================================================
// mock-api.ts — intercepts the app's network calls and serves fake data
// =============================================================================
// HOW page.route WORKS:
// You give it a URL pattern and a handler. Whenever the browser tries to make
// a matching request, Playwright pauses it and hands you a `route` object.
// You then either:
//   • route.fulfill({ ... })  → return a fake response (what we do)
//   • route.continue()        → let it hit the real network
//   • route.abort()           → simulate a network failure
//
// Because interception happens at the BROWSER level, it catches requests to any
// origin — including the app's http://localhost:8000 backend — so we never need
// a real backend running for the mocked tier.
// =============================================================================

import type { Page } from '@playwright/test'
import type { Match, Commentary } from '@/lib/types'
import { mockMatches, mockCommentary } from './mock-data'

interface MockOptions {
  matches?: Match[]
  commentary?: Commentary[]
}

/**
 * Wire up fake REST responses for the matches + commentary endpoints.
 * Call this BEFORE page.goto() so the routes are in place when the app loads.
 */
export async function setupMockApi(page: Page, opts: MockOptions = {}): Promise<void> {
  const matches = opts.matches ?? mockMatches
  const commentary = opts.commentary ?? mockCommentary

  // Commentary endpoint: /matches/:id/commentary?... — register first so it
  // takes precedence over the more general /matches route below.
  await page.route(/\/matches\/\d+\/commentary/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: commentary }),
    })
  })

  // Matches list endpoint: /matches?limit=...
  await page.route(/\/matches(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: matches }),
    })
  })
}
