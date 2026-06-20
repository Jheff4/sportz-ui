// =============================================================================
// sentry.ts — shared Sentry configuration
// =============================================================================
//
// WHAT SENTRY DOES:
// Sentry is an error tracking tool. Every time a JavaScript error is thrown
// anywhere in your app — whether the user sees it or not — Sentry captures:
//   1. The full stack trace (with source maps applied, so you see your real
//      TypeScript line numbers, not minified bundle gibberish)
//   2. The browser, OS, and device the user was on
//   3. What the user was doing in the 60 seconds before the error (breadcrumbs)
//   4. Any custom context you attach (e.g. which match they were watching)
//   5. Session replay — a video-like recording of the user's screen
//
// WHERE YOU SEE THIS:
// sentry.io → your project → Issues
// Every unique error gets deduplicated (100 users hitting the same bug = 1 issue,
// not 100 separate noise entries). You see: how many users affected, first seen,
// last seen, the exact line of code, and a replay of what happened.
//
// DSN (Data Source Name):
// This is your project's unique "send errors here" address.
// Get it from: sentry.io → Settings → Projects → your project → Client Keys
//
// TRACE SAMPLE RATE:
// Performance tracing captures timing data for every user interaction.
// 0.1 = 10% of sessions are traced (enough to spot slow patterns without
// sending gigabytes of data). In dev we use 1.0 (100%) so you see everything.
//
// SESSION REPLAY:
// replaysSessionSampleRate: 0.1 → record 10% of all sessions
// replaysOnErrorSampleRate: 1.0 → ALWAYS record sessions where an error occurs
// This means you almost never miss context around a real bug.
// =============================================================================

export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',

  // Which environment label shows in the Sentry dashboard
  environment: process.env.NODE_ENV,

  // Performance tracing — how many page loads to trace end-to-end
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay settings
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Add the app version so you can filter issues by release in the dashboard
  release: process.env.NEXT_PUBLIC_APP_VERSION ?? 'development',

  // Don't send errors for these known non-issues
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /^Network Error$/,
  ],
}
