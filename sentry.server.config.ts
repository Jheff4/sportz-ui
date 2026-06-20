// =============================================================================
// sentry.server.config.ts — Sentry initialisation for the NODE.JS SERVER
// =============================================================================
//
// Runs in Next.js server components, API route handlers, and getServerSideProps.
// No Replay integration here — session replay is browser-only.
// No browserTracingIntegration — that's browser-only too.
//
// WHY THIS MATTERS FOR YOUR APP:
// Right now sportz-ui is mostly client-side, but if you add server actions,
// API routes, or server components that throw, Sentry captures those too.
// Server errors are often invisible to users — they see a generic error page.
// Sentry makes them visible to you.
// =============================================================================

import * as Sentry from '@sentry/nextjs'
import { SENTRY_CONFIG } from '@/lib/sentry'

Sentry.init({
  ...SENTRY_CONFIG,
  // No browser-specific integrations here
})
