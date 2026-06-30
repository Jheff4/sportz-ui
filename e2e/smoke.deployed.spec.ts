import { test, expect } from '@playwright/test'

// =============================================================================
// smoke.deployed.spec.ts — post-deploy smoke test against the LIVE stack
// =============================================================================
//
// This is the ONLY spec that hits real, deployed infrastructure: the Vercel
// frontend talking to the Render backend. It has NO mocks — that's the whole
// point. It answers the one question the mocked suite can't: "is the deployed
// system actually wired together?" (correct API URL baked in, CORS allows the
// Vercel origin, the wss:// upgrade works through Render's proxy).
//
// HOW IT RUNS (never in the normal suite or CI):
//   npm run test:e2e:deployed
// which sets PLAYWRIGHT_NO_SERVER=1 (don't build a local server) and
// PLAYWRIGHT_BASE_URL=https://sportz-ui.vercel.app, and greps only "@deployed".
// The default `npm run test:e2e` excludes this via --grep-invert @deployed.
//
// RULES OF A DEPLOYED SMOKE:
//   • Read-only — never POST/mutate production data.
//   • Assert PRESENCE/shape, never exact values (real data changes).
//   • Generous timeouts — Render's free tier cold-starts (30–60s on first hit).
// =============================================================================

test.describe('Deployed smoke @deployed', () => {
  // Force a desktop width so the xl: commentary panel is present.
  test.use({ viewport: { width: 1440, height: 900 } })

  // Cold Render backend can take a while to wake; give the whole test room.
  test.setTimeout(120_000)

  test('the live site loads, shows real matches, connects the socket, and opens commentary', async ({
    page,
  }) => {
    await page.goto('/')

    // 1. The app actually loaded (frontend is deployed and serving).
    await expect(page.getByRole('heading', { name: 'Sportz', level: 1 })).toBeVisible()

    // 2. At least one real match rendered (REST wiring: API URL + CORS + data).
    //    Presence only — we don't assert which teams or how many.
    const firstCard = page.locator('[data-testid^="match-card-"]').first()
    await expect(firstCard).toBeVisible({ timeout: 60_000 })

    // 3. The WebSocket connected (the wss:// upgrade through Render's proxy —
    //    the thing mocks can never verify). The badge reads "Live Connected".
    await expect(page.getByRole('status', { name: /connected/i })).toBeVisible({
      timeout: 60_000,
    })

    // 4. Clicking Watch Live wires through to the commentary panel. We assert
    //    the interaction took effect (the card flips to a "Watching" control)
    //    rather than any specific commentary — a real match may have none.
    await firstCard.getByRole('button', { name: /watch .* live/i }).click()
    await expect(page.getByRole('button', { name: /watching/i })).toBeVisible()
    await expect(page.getByTestId('commentary-panel')).toBeVisible()
  })
})
