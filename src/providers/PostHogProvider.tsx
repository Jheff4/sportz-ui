'use client'

// =============================================================================
// PostHogProvider.tsx
// =============================================================================
//
// WHAT POSTHOG DOES:
// PostHog is a product analytics tool. While Sentry tells you "what broke",
// PostHog tells you "what users are doing". It answers questions like:
//   - How many users clicked "Watch Live" today?
//   - Which sport (football/cricket/basketball) gets watched the most?
//   - How long do users stay on the commentary panel before closing it?
//   - Do users who toggle dark mode engage more with the app?
//   - What's the conversion from "landing on the page" to "watching a match"?
//
// WHERE YOU SEE THIS:
// app.posthog.com → your project → Insights (build charts/funnels)
//                                → Session Recordings (watch user sessions)
//                                → Feature Flags (A/B testing)
//
// HOW TO GET YOUR KEY:
// posthog.com → sign up → new project → copy the Project API key (ph_xxx...)
// The host is either 'https://app.posthog.com' (US) or 'https://eu.i.posthog.com' (EU)
//
// WHY posthog-js/react:
// PostHog has a React-specific package that provides usePostHog() hook and
// <PostHogProvider>. This means you can call posthog.capture() from any
// component without importing the posthog instance manually each time.
//
// PAGE VIEW TRACKING:
// We hook into Next.js router events to track every page navigation.
// In a single-page app, the browser doesn't reload on navigation — PostHog's
// default auto-capture misses these. The usePathname hook + useEffect combo
// fires a manual 'pageview' capture every time the URL changes.
// =============================================================================

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

// Initialise PostHog once when this module loads in the browser.
// The typeof window check prevents this from running on the server
// (Next.js server-renders providers — posthog-js is browser-only).
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    person_profiles: 'identified_only', // don't create profiles for anonymous users
    capture_pageview: false, // we handle this manually below (Next.js SPA routing)
    capture_pageleave: true, // track when users leave — for session length
    autocapture: true, // automatically capture clicks, form submits, etc.
    session_recording: {
      maskAllInputs: true, // never record what users type
    },
  })
}

// This inner component tracks route changes.
// It's wrapped in Suspense because useSearchParams() requires it in Next.js.
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const phog = usePostHog()

  useEffect(() => {
    if (!pathname || !phog) return

    let url = window.origin + pathname
    if (searchParams?.toString()) {
      url += `?${searchParams.toString()}`
    }

    // '$pageview' is PostHog's standard event name for page loads.
    // Using the standard name means PostHog's built-in dashboards
    // (like the default "Web Analytics" dashboard) automatically
    // pick it up without any extra configuration.
    phog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams, phog])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
