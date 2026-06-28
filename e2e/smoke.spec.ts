import { test, expect } from '@playwright/test'
import { setupMockApi } from './fixtures/mock-api'

// =============================================================================
// smoke.spec.ts — the most basic check: does the app load and show data?
// =============================================================================
// ANATOMY OF A PLAYWRIGHT TEST:
//   test('name', async ({ page }) => { ... })
//     • `page` is a fresh browser tab, injected by Playwright (a "fixture").
//     • `await` everything — browser actions are async.
//     • `expect(locator).toBeVisible()` auto-waits up to the timeout for the
//       condition, so you don't write manual sleeps. This auto-waiting is the
//       thing that makes Playwright reliable vs older tools.
//
// LOCATORS (how you find elements), best → last resort:
//   getByRole('heading', { name }) — what a screen reader sees (most robust)
//   getByText('...')               — visible text
//   getByTestId('...')             — our data-testid hooks (stable, explicit)
// =============================================================================

test.describe('Smoke — app loads with data', () => {
  test('renders the header and match cards from the (mocked) API', async ({ page }) => {
    // 1. Set up fake API responses BEFORE navigating, so they're ready when
    //    the app fires its fetch on load.
    await setupMockApi(page)

    // 2. Open the app. '/' is resolved against baseURL from the config.
    await page.goto('/')

    // 3. The logo heading is present → the shell rendered.
    await expect(page.getByRole('heading', { name: 'Sportz', level: 1 })).toBeVisible()

    // 4. The match grid and both mocked cards rendered from our fake data.
    await expect(page.getByTestId('match-grid')).toBeVisible()
    await expect(page.getByTestId('match-card-1')).toBeVisible()
    await expect(page.getByTestId('match-card-2')).toBeVisible()

    // 5. The actual content from our mock data is on screen.
    await expect(page.getByText('Arsenal FC')).toBeVisible()
    await expect(page.getByText('Forest Rangers')).toBeVisible()
  })
})
