// =============================================================================
// sentry.client.config.ts — Sentry initialisation for the BROWSER
// =============================================================================
//
// Next.js loads this file automatically before any client-side code runs.
// Think of it as the browser-side "boot" for Sentry.
//
// WHY SEPARATE CLIENT/SERVER/EDGE FILES:
// Your Next.js app runs in three different environments:
//   - Browser        → sentry.client.config.ts  (this file)
//   - Node.js server → sentry.server.config.ts  (API routes, server components)
//   - Edge runtime   → sentry.edge.config.ts    (middleware)
// Each environment has different capabilities, so Sentry needs three configs.
// The browser can't import Node.js modules, and vice versa.
//
// REPLAY INTEGRATION:
// This is what enables session replay. It adds ~60KB to your bundle
// (lazy-loaded only when a session is actually being recorded).
// It records DOM mutations, clicks, and scrolls — NOT keystrokes in password
// fields or sensitive inputs (Sentry masks those automatically).
// =============================================================================

import * as Sentry from '@sentry/nextjs'
import { SENTRY_CONFIG } from '@/lib/sentry'

Sentry.init({
  ...SENTRY_CONFIG,

  integrations: [
    // Session Replay — video-like recording of user sessions
    Sentry.replayIntegration({
      // Mask all text content in replays (replace with ***) for privacy
      maskAllText: false,
      // Block all images from being captured in replays
      blockAllMedia: false,
    }),

    // Capture unhandled promise rejections (missing .catch() blocks, etc.)
    Sentry.browserTracingIntegration(),
  ],
})
