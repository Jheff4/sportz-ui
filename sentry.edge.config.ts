// =============================================================================
// sentry.edge.config.ts — Sentry initialisation for EDGE RUNTIME
// =============================================================================
//
// Edge runtime = Next.js middleware (middleware.ts).
// Edge has a restricted API — no Node.js built-ins, very limited runtime.
// This config is intentionally minimal.
//
// WHY IT'S NEEDED:
// If your middleware throws (e.g. authentication check fails with an exception),
// Sentry captures it here. Without this file, edge errors are silently dropped.
// =============================================================================

import * as Sentry from '@sentry/nextjs'
import { SENTRY_CONFIG } from '@/lib/sentry'

Sentry.init({
  ...SENTRY_CONFIG,
})
