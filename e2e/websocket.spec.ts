import { test, expect } from '@playwright/test'
import { setupMockApi } from './fixtures/mock-api'
import { setupMockWebSocket } from './fixtures/mock-ws'
import { newCommentaryEvent } from './fixtures/mock-data'

// =============================================================================
// websocket.spec.ts — the live, real-time behavior (the core of Sportz)
// =============================================================================
// Uses BOTH mocks: setupMockApi (REST) + setupMockWebSocket (live feed).
// Register both BEFORE page.goto so they're active when the app connects.
//
// LESSON (learned from a failure): the app renders commentary in TWO places —
// the desktop panel AND a hidden mobile bottom sheet (xl:hidden, still in the
// DOM). getByText matches by content across the WHOLE DOM, so an unscoped
// locator resolves to 2 elements and Playwright's "strict mode" rightly errors.
// Fix: SCOPE the locator to the panel — locator.getByText(...) only searches
// inside that subtree. Scoping is the idiomatic way to disambiguate.
// =============================================================================

test.describe('Real-time — WebSocket', () => {
  test('shows "Live Connected" once the WebSocket opens', async ({ page }) => {
    await setupMockApi(page)
    await setupMockWebSocket(page)
    await page.goto('/')

    await expect(page.getByRole('status', { name: /WebSocket status/i })).toContainText(
      /Live Connected/i
    )
  })

  test('clicking Watch Live opens the commentary panel with existing events', async ({ page }) => {
    await setupMockApi(page)
    await setupMockWebSocket(page)
    await page.goto('/')

    await page.getByRole('button', { name: /Watch Arsenal FC vs Manchester City live/i }).click()

    // Scope to the desktop commentary panel so we don't also match the
    // (hidden) mobile bottom sheet that renders the same events.
    const panel = page.getByTestId('commentary-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('A composed finish from close range.')).toBeVisible()
  })

  test('a commentary event pushed over the WebSocket appears live in the panel', async ({
    page,
  }) => {
    await setupMockApi(page)
    const ws = await setupMockWebSocket(page)
    await page.goto('/')

    await page.getByRole('button', { name: /Watch Arsenal FC vs Manchester City live/i }).click()

    const panel = page.getByTestId('commentary-panel')
    await expect(panel.getByText('A composed finish from close range.')).toBeVisible()

    // The new event isn't in the panel yet...
    await expect(panel.getByText('Fresh legs coming on to change the tempo.')).toHaveCount(0)

    // ...the "server" pushes a live commentary event...
    await ws.pushCommentary(newCommentaryEvent)

    // ...and it appears live, no reload.
    await expect(panel.getByText('Fresh legs coming on to change the tempo.')).toBeVisible()
    await expect(panel.getByTestId('commentary-event-102')).toBeVisible()
  })
})
