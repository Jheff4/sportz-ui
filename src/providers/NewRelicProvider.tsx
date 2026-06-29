'use client'

// =============================================================================
// NewRelicProvider.tsx
// =============================================================================
//
// WHAT NEW RELIC BROWSER DOES:
// New Relic Browser is a performance monitoring tool. While Sentry captures
// errors and PostHog tracks user behaviour, New Relic answers:
//   - How long does the page take to load for real users? (not Lighthouse —
//     actual users on actual connections in actual locations)
//   - What are the Core Web Vitals (LCP, CLS, INP) for your real traffic?
//   - Which API calls (to :8000) are slow, and how slow?
//   - How much JavaScript error rate is there across all sessions?
//   - Which country/region has the worst performance?
//
// CORE WEB VITALS — what you're measured on by Google:
//   LCP (Largest Contentful Paint) — how long until the main content loads
//   CLS (Cumulative Layout Shift)  — does the page jump around as it loads?
//   INP (Interaction to Next Paint) — how fast does the UI respond to clicks?
//
// WHERE YOU SEE THIS:
// one.newrelic.com → Browser → your app
//   - Page views dashboard  → load time by page, country, device
//   - Core Web Vitals       → LCP/CLS/INP for real users
//   - AJAX                  → every fetch() to your API, with timing
//   - JS Errors             → same errors as Sentry but with perf context
//   - Session traces        → like PostHog recordings but with performance data
//
// HOW TO GET YOUR CONFIG:
// one.newrelic.com → Add Data → Browser → your app → Copy/paste the JS snippet
// The snippet contains accountID, agentID, licenseKey, and applicationID.
// Put those values in your environment variables.
//
// WHY NPM PACKAGE NOT SNIPPET:
// The traditional New Relic approach is to paste a <script> snippet in <head>.
// The npm package (@newrelic/browser-agent) is cleaner for Next.js:
//   - No raw script injection required
//   - Tree-shakeable — only import the features you need
//   - Works with Next.js's strict CSP headers
//   - Can be lazy-loaded after the page is interactive (better LCP score!)
//
// WHY LAZY LOAD NEW RELIC:
// Ironic but true — if you load a performance monitoring tool synchronously
// in <head>, it blocks rendering and *hurts* your LCP score. We load it
// after the page hydrates so it doesn't impact the metrics it's measuring.
// =============================================================================

import { useEffect } from 'react'

export function NewRelicProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialise in the browser, and only if credentials are present.
    // Missing credentials = skip silently (no console errors in dev).
    const accountID = process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID
    const agentID = process.env.NEXT_PUBLIC_NEW_RELIC_AGENT_ID
    const licenseKey = process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY
    const applicationID = process.env.NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID

    if (!accountID || !agentID || !licenseKey || !applicationID) return

    // Dynamically import so New Relic loads AFTER the page is interactive.
    // This is a deliberate performance decision — see WHY LAZY LOAD above.
    import('@newrelic/browser-agent/loaders/browser-agent').then(({ BrowserAgent }) => {
      new BrowserAgent({
        init: {
          distributed_tracing: { enabled: true }, // link browser → backend traces
          privacy: { cookies_enabled: true },
          ajax: { deny_list: [] }, // track all AJAX requests
          session_replay: {
            enabled: true,
            sampling_rate: 10, // record 10% of sessions
            error_sampling_rate: 100, // always record sessions with errors
            mask_all_inputs: true,
          },
        },
        info: {
          beacon: 'bam.nr-data.net',
          errorBeacon: 'bam.nr-data.net',
          licenseKey,
          applicationID,
          sa: 1,
        },
        loader_config: {
          accountID,
          agentID,
          licenseKey,
          applicationID,
          trustKey: accountID,
        },
      })
    })
  }, []) // runs once after first render — intentional

  return <>{children}</>
}
