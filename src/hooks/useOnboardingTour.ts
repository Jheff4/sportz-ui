'use client'

// =============================================================================
// useOnboardingTour.ts — a short guided tour of the app (driver.js)
// =============================================================================
//
// Runs ONCE on a first visit (localStorage flag), and can be replayed via the
// "?" button in the header (startTour). Steps target existing, stable selectors
// (roles / aria-labels / test ids) so we don't have to thread `data-tour`
// attributes through components.
//
// `ready` (matches have rendered) gates the auto-start, so the tour doesn't fire
// against an empty page while the first fetch is still in flight. Steps whose
// target isn't currently visible (e.g. the desktop commentary panel on mobile)
// are filtered out at run time.
// =============================================================================

import { useCallback, useEffect } from 'react'
import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

const SEEN_KEY = 'sportz_tour_seen_v1'

const STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Welcome to Sportz ⚽',
      description:
        'A real-time sports broadcast — scores and ball-by-ball commentary stream live over WebSockets. Here’s the 20-second tour.',
    },
  },
  {
    element: '[data-testid^="match-card-"]',
    popover: {
      title: 'Live matches',
      description:
        'Real fixtures across football, basketball, cricket and more. Scores tick up in real time as events happen — no refresh.',
    },
  },
  {
    element: 'button[aria-label^="Watch "]',
    popover: {
      title: 'Follow a match',
      description: 'Click “Watch Live” on any match to follow its commentary.',
    },
  },
  {
    element: '[data-testid="commentary-panel"]',
    popover: {
      title: 'Live commentary',
      description:
        'Ball-by-ball commentary streams in here the instant it happens, pushed straight over the WebSocket.',
    },
  },
  {
    element: '[aria-label^="WebSocket status"]',
    popover: {
      title: 'Live connection',
      description:
        'Your real-time connection status. If the network drops, it reconnects automatically with backoff.',
    },
  },
  {
    element: 'button[aria-label*="mode"]',
    popover: {
      title: 'Your theme',
      description: 'Switch between light and dark whenever you like.',
    },
  },
]

// Keep only steps whose target is actually on screen (an element with a layout
// box). Elementless steps (the welcome popover) always pass.
function visibleSteps(): DriveStep[] {
  return STEPS.filter((step) => {
    if (!step.element || typeof step.element !== 'string') return true
    const el = document.querySelector(step.element)
    return el instanceof HTMLElement && el.offsetParent !== null
  })
}

export function useOnboardingTour(ready: boolean) {
  const startTour = useCallback(() => {
    driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Got it',
      popoverClass: 'sportz-tour', // themed in globals.css to the design system
      steps: visibleSteps(),
    }).drive()
  }, [])

  // Auto-start once, after matches have rendered.
  useEffect(() => {
    if (!ready) return
    // Never auto-pop the tour under automation (Playwright) — it would cover the
    // page and break the e2e/smoke tests. The "?" button still works everywhere.
    if (navigator.webdriver) return
    if (localStorage.getItem(SEEN_KEY)) return
    const id = window.setTimeout(() => {
      startTour()
      localStorage.setItem(SEEN_KEY, '1')
    }, 700)
    return () => window.clearTimeout(id)
  }, [ready, startTour])

  return { startTour }
}
