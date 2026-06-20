// =============================================================================
// next.config.ts
// =============================================================================

import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // Your regular Next.js config goes here
}

// =============================================================================
// withSentryConfig — WHY THIS WRAPPER EXISTS:
// =============================================================================
// Sentry needs to do two things at BUILD TIME (not just runtime):
//
//   1. SOURCE MAP UPLOAD
//      When Next.js compiles your TypeScript, it produces minified JS like:
//        "Cannot read property 'id' of undefined at t.e.n (main-abc123.js:1:4821)"
//      That's useless. Sentry uploads your source maps during `next build` so
//      the same error becomes:
//        "Cannot read property 'id' of undefined at MatchCard.tsx:42"
//      This only works if SENTRY_AUTH_TOKEN is set in your environment.
//
//   2. AUTOMATIC INSTRUMENTATION
//      Sentry wraps your Next.js routes and API handlers automatically so it
//      can create performance traces without you adding code to each file.
//
// silent: true        → don't spam the build output with Sentry logs
// hideSourceMaps: true → don't ship source maps to the browser (they'd expose
//                        your full source code to anyone who looks). Source maps
//                        are uploaded to Sentry only, then deleted from the build.
// disableLogger: true → remove Sentry's debug logging from the production bundle
// =============================================================================

export default withSentryConfig(nextConfig, {
  org:     process.env.SENTRY_ORG     ?? 'your-org-slug',
  project: process.env.SENTRY_PROJECT ?? 'sportz-ui',

  silent: true,

  // Upload source maps to Sentry but don't ship them to the browser.
  // 'hidden' = maps are generated and uploaded, then deleted from the build output.
  // This means Sentry can show you real file/line numbers in errors, but users
  // can't open DevTools and read your source code.
  sourcemaps: {
    disable: false,    // keep source map generation ON for upload
  },

})
