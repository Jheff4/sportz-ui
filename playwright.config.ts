import { defineConfig, devices } from '@playwright/test'

// =============================================================================
// playwright.config.ts — how Playwright finds, runs, and reports E2E tests
// =============================================================================
//
// LEARNING NOTES (read top to bottom):
//
// • testDir       — where our test files live (./e2e). Files end in .spec.ts.
// • baseURL       — the app's address. In tests we write page.goto('/') and
//                   Playwright prepends this. We read it from an env var so the
//                   SAME tests can later point at a local stack or the deployed
//                   site (the mocked → local → deployed progression) just by
//                   changing PLAYWRIGHT_BASE_URL.
// • webServer     — Playwright starts our Next.js app automatically before the
//                   tests, and shuts it down after. We run a PRODUCTION build
//                   (`next build && next start`), not `next dev`, on purpose:
//                   `next dev` compiles each route on-demand, so under
//                   fullyParallel several cold compiles serialize and blow past
//                   the 30s timeout (flaky, shifting failures). `next start`
//                   serves pre-compiled routes instantly — reliable AND it's the
//                   exact build CI and Vercel run, so we test what ships.
//                   reuseExistingServer means "if a server is already on :3000,
//                   use it" (handy locally) — but in CI we always start fresh.
// • trace/screenshot — on failure, Playwright saves a screenshot AND a "trace"
//                   (a full timeline you can replay in a viewer). This is the
//                   single best feature for learning: when a test fails you SEE
//                   exactly what the browser saw, step by step.
// • projects      — which browser(s) to run in. We start with Chromium only;
//                   adding Firefox/WebKit later is one line each.
// =============================================================================

// Tests run on their OWN port (3100), separate from `next dev` (:3000). This
// lets the dev server and the test server coexist — leave `npm run dev` running
// while you run e2e; they never collide. Override with PLAYWRIGHT_BASE_URL to
// point the same tests at a local stack or the deployed site later.
const PORT = 3100
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',

  // Run tests in files in parallel (fast). Each test gets its own isolated
  // browser context (like a fresh incognito window) — no shared cookies/state.
  fullyParallel: true,

  // Fail the CI build if someone accidentally commits a test.only()
  forbidOnly: !!process.env.CI,

  // Retry once in CI to absorb rare flakiness; never retry locally (so you
  // see failures immediately while developing).
  retries: process.env.CI ? 1 : 0,

  // 'html' opens a rich visual report; 'list' prints progress in the terminal.
  reporter: process.env.CI ? [['html'], ['list']] : 'list',

  use: {
    baseURL,
    // Capture a replayable trace + screenshot only when a test fails.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  // Start the Next.js app before tests (skipped when testing a remote URL —
  // we'll set PLAYWRIGHT_NO_SERVER for the deployed tier later).
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        // Always our OWN fresh production server on PORT. We don't reuse an
        // existing server: `next dev` (the flaky-under-parallelism one) must
        // never be the thing under test. A prod build mirrors CI/Vercel.
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: false,
        // Generous: covers the production build + server boot on a cold machine.
        timeout: 180_000,
      },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
